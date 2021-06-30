import type * as Core from '@contentlayer/core'
import type { Cache, Document, Markdown, MDX, Options } from '@contentlayer/core'
import { bundleMDX } from '@contentlayer/core'
import { markdownToHtml } from '@contentlayer/core'
import {
  casesHandled,
  isNotUndefined,
  promiseMap,
  promiseMapPool,
  promiseMapToDict,
  traceAsyncFn,
  tracer,
} from '@contentlayer/utils'
import { promises as fs } from 'fs'
import { promise as glob } from 'glob-promise'
import matter from 'gray-matter'
import * as yaml from 'js-yaml'
import * as os from 'os'
import * as path from 'path'
import { match } from 'ts-pattern'

import type { Flags } from '.'
import type { FilePathPatternMap, RawDocumentData } from './types'

export const fetchAllDocuments = traceAsyncFn('@contentlayer/source-local/fetchData:fetchAllDocuments')(
  async ({
    schemaDef,
    filePathPatternMap,
    contentDirPath,
    flags,
    options,
  }: {
    schemaDef: Core.SchemaDef
    filePathPatternMap: FilePathPatternMap
    contentDirPath: string
    flags: Flags
    options?: Options
  }): Promise<Cache> => {
    const documentDefNameWithRelativeFilePathArray = await getDocumentDefNameWithRelativeFilePathArray({
      contentDirPath,
      filePathPatternMap,
    })

    const concurrencyLimit = os.cpus().length

    const documents = await promiseMapPool(
      documentDefNameWithRelativeFilePathArray,
      ({ documentDefName, relativeFilePath }) =>
        makeDocumentFromFilePath({
          relativeFilePath,
          schemaDef,
          documentDefName,
          contentDirPath,
          flags,
          options,
        }),
      concurrencyLimit,
    ).then((_) => _.filter(isNotUndefined))

    return { documents, lastUpdateInMs: new Date().getTime() }
  },
)

type Content = ContentMarkdown | ContentMDX | ContentJSON | ContentYAML
type ContentMarkdown = {
  readonly kind: 'markdown'
  data: Record<string, any> & { content: string }
}
type ContentMDX = {
  readonly kind: 'mdx'
  data: Record<string, any> & { content: string }
}
type ContentJSON = {
  readonly kind: 'json'
  data: Record<string, any>
}
type ContentYAML = {
  readonly kind: 'yaml'
  data: Record<string, any>
}

export const getDocumentDefNameWithRelativeFilePathArray = async ({
  filePathPatternMap,
  contentDirPath,
}: {
  filePathPatternMap: FilePathPatternMap
  contentDirPath: string
}): Promise<{ relativeFilePath: string; documentDefName: string }[]> => {
  const documentDefNameWithRelativeFilePathsArray = await Promise.all(
    Object.entries(filePathPatternMap).map(async ([documentDefName, filePathPattern]) => ({
      documentDefName,
      relativeFilePaths: await glob(filePathPattern, { cwd: contentDirPath }),
    })),
  )

  const documentDefNameWithRelativeFilePathArray = documentDefNameWithRelativeFilePathsArray.flatMap(
    ({ documentDefName, relativeFilePaths }) =>
      relativeFilePaths.map((relativeFilePath) => ({ relativeFilePath, documentDefName })),
  )

  return documentDefNameWithRelativeFilePathArray
}

export const makeDocumentFromFilePath = traceAsyncFn('@contentlayer/source-local/fetchData:makeDocumentFromFilePath')(
  async ({
    relativeFilePath,
    schemaDef,
    documentDefName,
    contentDirPath,
    flags,
    options,
  }: {
    relativeFilePath: string
    schemaDef: Core.SchemaDef
    documentDefName: string
    contentDirPath: string
    flags: Flags
    options?: Options
  }): Promise<Core.Document | undefined> => {
    const readFileSpan = tracer.startSpan('@contentlayer/source-local/fetchData:makeDocumentFromFilePath:read-file')

    const fullFilePath = path.join(contentDirPath, relativeFilePath)

    const fileContent = await fs.readFile(fullFilePath, 'utf-8')
    const filePathExtension = relativeFilePath.toLowerCase().split('.').pop()
    const content = match<string | undefined, Content>(filePathExtension)
      .with('md', () => {
        const markdown = matter(fileContent)
        return {
          kind: 'markdown',
          data: { ...markdown.data, content: markdown.content },
        }
      })
      .with('mdx', () => {
        const markdown = matter(fileContent)
        return {
          kind: 'mdx',
          data: { ...markdown.data, content: markdown.content },
        }
      })
      .with('json', () => ({ kind: 'json', data: JSON.parse(fileContent) }))
      .when(
        (_) => ['yaml', 'yml'].includes(_ ?? ''),
        () => ({ kind: 'yaml', data: yaml.load(fileContent) as object }),
      )
      .otherwise(() => {
        throw new Error(`Unsupported file extension "${filePathExtension}" for ${relativeFilePath}`)
      })

    readFileSpan.end()

    const isValid = checkSchema({ content, relativeFilePath, documentDefName, schemaDef, flags })
    if (!isValid) {
      return undefined
    }

    const documentDef = schemaDef.documentDefMap[documentDefName]

    const doc = await makeDocument({ documentDef, rawContent: content, schemaDef, relativeFilePath, options })

    const computedValues = await getComputedValues({ documentDef, doc })
    if (computedValues) {
      Object.entries(computedValues).forEach(([fieldName, value]) => {
        doc[fieldName] = value
      })
    }

    return doc
  },
)

function checkSchema({
  schemaDef,
  content,
  relativeFilePath,
  documentDefName,
  flags,
}: {
  schemaDef: Core.SchemaDef
  content: Content
  /** relativeFilePath just needed for better error handling */
  relativeFilePath: string
  documentDefName: string
  flags: Flags
}): boolean {
  const documentDef = schemaDef.documentDefMap[documentDefName]

  if (documentDef === undefined) {
    throw new Error(`No matching document definition found for "${relativeFilePath}"`)
  }

  const existingDataFieldKeys = Object.keys(content.data)

  // make sure all required fields are present
  const requiredFields = documentDef.fieldDefs.filter((_) => _.required)
  const misingRequiredFields = requiredFields.filter((fieldDef) => !existingDataFieldKeys.includes(fieldDef.name))
  if (misingRequiredFields.length > 0) {
    const misingRequiredFieldsStr = misingRequiredFields.map((_, i) => `     ${i + 1}: ` + JSON.stringify(_)).join('\n')

    const message = `\
Missing required fields (type: "${documentDef.name}") for "${relativeFilePath}".
  Missing fields:
${misingRequiredFieldsStr}
`

    switch (flags.onMissingOrIncompatibleData) {
      case 'skip':
        console.log(`Skipping document. Reason: ${message}`)
        return false
      case 'skip-ignore':
        return false
      case 'fail':
        throw new Error(`Error: ${message}`)
    }
  }

  // TODO validate whether data has correct type

  // warn about data fields not defined in the schema
  if (flags.onExtraData === 'warn') {
    const schemaFieldNames = documentDef.fieldDefs.map((_) => _.name)
    const extraFieldKeys = existingDataFieldKeys.filter((fieldKey) => !schemaFieldNames.includes(fieldKey))
    if (extraFieldKeys.length > 0) {
      console.log(`\
Warning: Document (type: "${
        documentDef.name
      }") contained fields that are not defined in schema for "${relativeFilePath}".

Extra fields:
${extraFieldKeys.map((key) => `  ${key}: ${JSON.stringify(content.data[key])}`).join('\n')}
`)
    }
  }

  // TODO validate objects

  return true
}

const makeDocument = async ({
  rawContent,
  documentDef,
  schemaDef,
  relativeFilePath,
  options,
}: {
  rawContent: Content
  documentDef: Core.DocumentDef
  schemaDef: Core.SchemaDef
  relativeFilePath: string
  options?: Options
}): Promise<Core.Document> => {
  const docValues = await promiseMapToDict(
    documentDef.fieldDefs,
    (fieldDef) =>
      getDataForFieldDef({
        fieldDef,
        rawFieldData: rawContent.data[fieldDef.name],
        schemaDef,
        options,
      }),
    (fieldDef) => fieldDef.name,
  )

  const _raw: RawDocumentData = {
    sourceFilePath: relativeFilePath,
    sourceFileName: path.basename(relativeFilePath),
    sourceFileDir: path.dirname(relativeFilePath),
    fileType: rawContent.kind,
    flattenedPath: getFlattenedPath(relativeFilePath),
  }

  const doc: Core.Document = {
    _typeName: documentDef.name,
    _id: relativeFilePath,
    _raw,
    ...docValues,
  }

  return doc
}

const getFlattenedPath = (relativeFilePath: string): string => {
  return (
    relativeFilePath
      // remove extension
      .split('.')
      .slice(0, -1)
      .join('.')
      // remove tailing `/index`
      .replace(/\index$/, '')
  )
}

const makeObject = async ({
  rawObjectData,
  fieldDefs,
  typeName,
  schemaDef,
  options,
}: {
  rawObjectData: Record<string, any>
  /** Passing `FieldDef[]` here instead of `ObjectDef` in order to also support `inline_object` */
  fieldDefs: Core.FieldDef[]
  typeName: string
  schemaDef: Core.SchemaDef
  options?: Options
}): Promise<Core.Object> => {
  const objValues = await promiseMapToDict(
    fieldDefs,
    (fieldDef) =>
      getDataForFieldDef({
        fieldDef,
        rawFieldData: rawObjectData[fieldDef.name],
        schemaDef,
        options,
      }),
    (fieldDef) => fieldDef.name,
  )
  const obj: Core.Object = { _typeName: typeName, _raw: {}, ...objValues }

  return obj
}

const getDataForFieldDef = async ({
  fieldDef,
  rawFieldData,
  schemaDef,
  options,
}: {
  fieldDef: Core.FieldDef
  rawFieldData: any
  schemaDef: Core.SchemaDef
  options?: Options
}): Promise<any> => {
  if (rawFieldData === undefined) {
    if (fieldDef.required) {
      console.error(`Inconsistent data found: ${fieldDef}`)
    }

    return undefined
  }

  switch (fieldDef.type) {
    case 'object':
      const objectDef = schemaDef.objectDefMap[fieldDef.objectName]
      return makeObject({
        rawObjectData: rawFieldData,
        fieldDefs: objectDef.fieldDefs,
        typeName: objectDef.name,
        schemaDef,
        options,
      })
    case 'inline_object':
      return makeObject({
        rawObjectData: rawFieldData,
        fieldDefs: fieldDef.fieldDefs,
        typeName: 'inline_object',
        schemaDef,
        options,
      })
    case 'reference':
      return rawFieldData
    case 'polymorphic_list':
    case 'list':
      return promiseMap(rawFieldData as any[], (rawItemData) =>
        getDataForListItem({ rawItemData, fieldDef, schemaDef, options }),
      )
    case 'date':
      return new Date(rawFieldData)
    case 'markdown':
      return <Markdown>{
        raw: rawFieldData,
        html: await markdownToHtml({ mdString: rawFieldData, options: options?.markdown }),
      }
    case 'mdx':
      return <MDX>{
        raw: rawFieldData,
        code: await bundleMDX({ mdxString: rawFieldData, options: options?.mdx }),
      }
    case 'boolean':
    case 'string':
    case 'number':
    case 'json':
    case 'slug':
    case 'text':
    case 'url':
    case 'enum':
    case 'image':
      return rawFieldData
    default:
      casesHandled(fieldDef)
  }
}

const getDataForListItem = async ({
  rawItemData,
  fieldDef,
  schemaDef,
  options,
}: {
  rawItemData: any
  fieldDef: Core.ListFieldDef | Core.PolymorphicListFieldDef
  schemaDef: Core.SchemaDef
  options?: Options
}): Promise<any> => {
  if (typeof rawItemData === 'string') {
    return rawItemData
  }

  if (fieldDef.type === 'polymorphic_list') {
    const objectTypeName = rawItemData[fieldDef.typeField]
    const objectDef = schemaDef.objectDefMap[objectTypeName]
    if (objectDef === undefined) {
      const valueTypeValues = fieldDef.of
        .filter((_): _ is Core.ListFieldItemObject => _.type === 'object')
        .map((_) => _.objectName)
        .join(', ')

      throw new Error(`\
Invalid value "${objectTypeName}" for type field "${fieldDef.typeField}" for field "${fieldDef.name}".
Needs to be one of the following values: ${valueTypeValues}`)
    }
    return makeObject({
      rawObjectData: rawItemData,
      fieldDefs: objectDef.fieldDefs,
      typeName: objectDef.name,
      schemaDef,
      options,
    })
  }

  switch (fieldDef.of.type) {
    case 'object':
      const objectDef = schemaDef.objectDefMap[fieldDef.of.objectName]
      return makeObject({
        rawObjectData: rawItemData,
        fieldDefs: objectDef.fieldDefs,
        typeName: objectDef.name,
        schemaDef,
        options,
      })
    case 'inline_object':
      return makeObject({
        rawObjectData: rawItemData,
        fieldDefs: fieldDef.of.fieldDefs,
        typeName: 'inline_object',
        schemaDef,
        options,
      })
    default:
      return rawItemData
  }
}

const getComputedValues = async ({
  doc,
  documentDef,
}: {
  documentDef: Core.DocumentDef
  doc: Document
}): Promise<undefined | Record<string, any>> => {
  if (documentDef.computedFields === undefined) {
    return undefined
  }

  const computedValues = await promiseMapToDict(
    documentDef.computedFields,
    (field) => field.resolve(doc),
    (field) => field.name,
  )

  return computedValues
}
