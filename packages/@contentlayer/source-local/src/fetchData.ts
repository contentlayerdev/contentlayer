import type * as Core from '@contentlayer/core'
import type { Cache, Document, Markdown, MDX, Options } from '@contentlayer/core'
import { bundleMDX } from '@contentlayer/core'
import { markdownToHtml } from '@contentlayer/core'
import {
  casesHandled,
  isNotUndefined,
  omit,
  promiseMap,
  promiseMapPool,
  promiseMapToDict,
  traceAsyncFn,
} from '@contentlayer/utils'
import { promises as fs } from 'fs'
import { promise as glob } from 'glob-promise'
import matter from 'gray-matter'
import * as yaml from 'js-yaml'
import * as os from 'os'
import * as path from 'path'
import { match } from 'ts-pattern'

import type { Flags } from '.'
import type { DocumentBodyType } from './schema'
import type { FilePathPatternMap, RawDocumentData } from './types'

export const fetchAllDocuments = (async ({
  schemaDef,
  filePathPatternMap,
  contentDirPath,
  flags,
  options,
  previousCache,
}: {
  schemaDef: Core.SchemaDef
  filePathPatternMap: FilePathPatternMap
  contentDirPath: string
  flags: Flags
  options?: Options
  previousCache: Cache | undefined
}): Promise<Cache> => {
  const documentDefNameWithRelativeFilePathArray = await getDocumentDefNameWithRelativeFilePathArray({
    contentDirPath,
    filePathPatternMap,
  })

  const concurrencyLimit = os.cpus().length

  const documents = await promiseMapPool(
    documentDefNameWithRelativeFilePathArray,
    ({ documentDefName, relativeFilePath }) =>
      makeCacheItemFromFilePath({
        relativeFilePath,
        schemaDef,
        documentDefName,
        contentDirPath,
        flags,
        options,
        previousCache,
      }),
    concurrencyLimit,
  ).then((_) => _.filter(isNotUndefined))

  const cacheItemsMap = Object.fromEntries(documents.map((_) => [_.document._id, _]))

  return { cacheItemsMap }
})['|>'](traceAsyncFn('@contentlayer/source-local/fetchData:fetchAllDocuments', (_) => omit(_, ['previousCache'])))

type RawContent = RawContentMarkdown | RawContentMDX | RawContentJSON | RawContentYAML
type RawContentMarkdown = {
  readonly kind: 'markdown'
  data: Record<string, any> & { body?: string }
}
type RawContentMDX = {
  readonly kind: 'mdx'
  data: Record<string, any> & { body?: string }
}
type RawContentJSON = {
  readonly kind: 'json'
  data: Record<string, any>
}
type RawContentYAML = {
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

export const makeCacheItemFromFilePath = (async ({
  relativeFilePath,
  schemaDef,
  documentDefName,
  contentDirPath,
  flags,
  options,
  previousCache,
}: {
  relativeFilePath: string
  schemaDef: Core.SchemaDef
  documentDefName: string
  contentDirPath: string
  flags: Flags
  options?: Options
  previousCache: Cache | undefined
}): Promise<Core.CacheItem | undefined> => {
  const fullFilePath = path.join(contentDirPath, relativeFilePath)

  const documentHash = (await fs.stat(fullFilePath)).mtime.getTime().toString()

  // return previous cache item if it exists
  if (
    previousCache &&
    previousCache.cacheItemsMap[relativeFilePath] &&
    previousCache.cacheItemsMap[relativeFilePath].documentHash === documentHash
  ) {
    return previousCache.cacheItemsMap[relativeFilePath]
  }

  const documentTypeDef = schemaDef.documentTypeDefMap[documentDefName]
  const includeBody = documentTypeDef.fieldDefs.some((_) => _.name === 'body' && _.isSystemField)

  const fileContent = await fs.readFile(fullFilePath, 'utf-8')
  const filePathExtension = relativeFilePath.toLowerCase().split('.').pop()

  const rawContent = match<string | undefined, RawContent>(filePathExtension)
    .with('md', () => {
      const markdown = matter(fileContent)
      const body = includeBody ? { body: markdown.content } : {}
      return {
        kind: 'markdown',
        data: { ...markdown.data, ...body },
      }
    })
    .with('mdx', () => {
      const markdown = matter(fileContent)
      const body = includeBody ? { body: markdown.content } : {}
      return {
        kind: 'mdx',
        data: { ...markdown.data, ...body },
      }
    })
    .with('json', () => ({ kind: 'json', data: JSON.parse(fileContent) }))
    .when(
      (_) => _ === 'yaml' || _ === 'yml',
      () => ({ kind: 'yaml', data: yaml.load(fileContent) as any }),
    )
    .otherwise(() => {
      throw new Error(`Unsupported file extension "${filePathExtension}" for ${relativeFilePath}`)
    })

  const isValid = checkSchema({ rawContent, relativeFilePath, documentDefName, schemaDef, flags })
  if (!isValid) {
    return undefined
  }

  const document = await makeDocument({
    documentTypeDef,
    rawContent,
    schemaDef,
    relativeFilePath,
    options,
  })

  const computedValues = await getComputedValues({ documentDef: documentTypeDef, doc: document })
  if (computedValues) {
    Object.entries(computedValues).forEach(([fieldName, value]) => {
      document[fieldName] = value
    })
  }

  return { document, documentHash }
})['|>'](
  traceAsyncFn('@contentlayer/source-local/fetchData:makeDocumentFromFilePath', (_) => omit(_, ['previousCache'])),
)

const checkSchema = ({
  schemaDef,
  rawContent,
  relativeFilePath,
  documentDefName,
  flags,
}: {
  schemaDef: Core.SchemaDef
  rawContent: RawContent
  /** relativeFilePath just needed for better error handling */
  relativeFilePath: string
  documentDefName: string
  flags: Flags
}): boolean => {
  const documentTypeDef = schemaDef.documentTypeDefMap[documentDefName]

  if (documentTypeDef === undefined) {
    throw new Error(`No matching document definition found for "${relativeFilePath}"`)
  }

  const existingDataFieldKeys = Object.keys(rawContent.data)

  // make sure all required fields are present
  const requiredFieldsWithoutDefaultValue = documentTypeDef.fieldDefs.filter(
    (_) => _.isRequired && _.default === undefined,
  )
  const misingRequiredFields = requiredFieldsWithoutDefaultValue.filter(
    (fieldDef) => !existingDataFieldKeys.includes(fieldDef.name),
  )
  if (misingRequiredFields.length > 0) {
    const misingRequiredFieldsStr = misingRequiredFields.map((_, i) => `     ${i + 1}: ` + JSON.stringify(_)).join('\n')

    const message = `\
Missing required fields (type: "${documentTypeDef.name}") for "${relativeFilePath}".
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
    const schemaFieldNames = documentTypeDef.fieldDefs.map((_) => _.name)
    const extraFieldKeys = existingDataFieldKeys.filter((fieldKey) => !schemaFieldNames.includes(fieldKey))
    if (extraFieldKeys.length > 0) {
      console.log(`\
Warning: Document (type: "${
        documentTypeDef.name
      }") contained fields that are not defined in schema for "${relativeFilePath}".

Extra fields:
${extraFieldKeys.map((key) => `  ${key}: ${JSON.stringify(rawContent.data[key])}`).join('\n')}
`)
    }
  }

  // TODO validate nesteds

  return true
}

const makeDocument = async ({
  rawContent,
  documentTypeDef,
  schemaDef,
  relativeFilePath,
  options,
}: {
  rawContent: RawContent
  documentTypeDef: Core.DocumentTypeDef
  schemaDef: Core.SchemaDef
  relativeFilePath: string
  options?: Options
}): Promise<Core.Document> => {
  const docValues = await promiseMapToDict(
    documentTypeDef.fieldDefs,
    (fieldDef) =>
      getDataForFieldDef({
        fieldDef,
        rawFieldData: rawContent.data[fieldDef.name],
        schemaDef,
        options,
      }),
    (fieldDef) => fieldDef.name,
  )

  const bodyType: DocumentBodyType = match(rawContent.kind)
    .with('markdown', () => 'markdown' as const)
    .with('mdx', () => 'mdx' as const)
    .otherwise(() => 'none' as const)

  const _raw: RawDocumentData = {
    sourceFilePath: relativeFilePath,
    sourceFileName: path.basename(relativeFilePath),
    sourceFileDir: path.dirname(relativeFilePath),
    bodyType,
    flattenedPath: getFlattenedPath(relativeFilePath),
  }

  const doc: Core.Document = {
    _typeName: documentTypeDef.name,
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
      .replace(/\/index$/, '')
  )
}

const makeNestedDocument = async ({
  rawObjectData,
  fieldDefs,
  typeName,
  schemaDef,
  options,
}: {
  rawObjectData: Record<string, any>
  /** Passing `FieldDef[]` here instead of `ObjectDef` in order to also support `inline_nested` */
  fieldDefs: Core.FieldDef[]
  typeName: string
  schemaDef: Core.SchemaDef
  options?: Options
}): Promise<Core.NestedDocument> => {
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
  const obj: Core.NestedDocument = { _typeName: typeName, _raw: {}, ...objValues }

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
    if (fieldDef.default !== undefined) {
      return fieldDef.default
    }

    if (fieldDef.isRequired) {
      console.error(`Inconsistent data found: ${fieldDef}`)
    }
    return undefined
  }

  switch (fieldDef.type) {
    case 'nested': {
      const nestedTypeDef = schemaDef.nestedTypeDefMap[fieldDef.nestedTypeName]
      return makeNestedDocument({
        rawObjectData: rawFieldData,
        fieldDefs: nestedTypeDef.fieldDefs,
        typeName: nestedTypeDef.name,
        schemaDef,
        options,
      })
    }
    case 'nested_unnamed':
      return makeNestedDocument({
        rawObjectData: rawFieldData,
        fieldDefs: fieldDef.typeDef.fieldDefs,
        typeName: '__UNNAMED__',
        schemaDef,
        options,
      })
    case 'nested_polymorphic': {
      const typeName = rawFieldData[fieldDef.typeField]

      if (!fieldDef.nestedTypeNames.includes(typeName)) {
        const validTypeNames = fieldDef.nestedTypeNames.map((_) => `"${_}"`).join(', ')
        throw new Error(
          `Invalid "${fieldDef.typeField}" value found: "${typeName}" for field "${fieldDef.name}". Valid values: ${validTypeNames}`,
        )
      }

      const nestedTypeDef = schemaDef.nestedTypeDefMap[typeName]!

      return makeNestedDocument({
        rawObjectData: rawFieldData,
        fieldDefs: nestedTypeDef.fieldDefs,
        typeName: nestedTypeDef.name,
        schemaDef,
        options,
      })
    }
    case 'reference':
    case 'reference_polymorphic':
      return rawFieldData
    case 'list_polymorphic':
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
    // case 'slug':
    // case 'text':
    // case 'url':
    case 'enum':
      // case 'image':
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
  fieldDef: Core.ListFieldDef | Core.ListPolymorphicFieldDef
  schemaDef: Core.SchemaDef
  options?: Options
}): Promise<any> => {
  if (typeof rawItemData === 'string') {
    return rawItemData
  }

  if (fieldDef.type === 'list_polymorphic') {
    const nestedTypeName = rawItemData[fieldDef.typeField]
    const nestedTypeDef = schemaDef.nestedTypeDefMap[nestedTypeName]
    if (nestedTypeDef === undefined) {
      const valueTypeValues = fieldDef.of
        .filter((_): _ is Core.ListFieldDefItem.ItemNested => _.type === 'nested')
        .map((_) => _.nestedTypeName)
        .join(', ')

      throw new Error(`\
Invalid value "${nestedTypeName}" for type field "${fieldDef.typeField}" for field "${fieldDef.name}".
Needs to be one of the following values: ${valueTypeValues}`)
    }
    return makeNestedDocument({
      rawObjectData: rawItemData,
      fieldDefs: nestedTypeDef.fieldDefs,
      typeName: nestedTypeDef.name,
      schemaDef,
      options,
    })
  }

  switch (fieldDef.of.type) {
    case 'nested':
      const nestedTypeDef = schemaDef.nestedTypeDefMap[fieldDef.of.nestedTypeName]
      return makeNestedDocument({
        rawObjectData: rawItemData,
        fieldDefs: nestedTypeDef.fieldDefs,
        typeName: nestedTypeDef.name,
        schemaDef,
        options,
      })
    case 'nested_unnamed':
      return makeNestedDocument({
        rawObjectData: rawItemData,
        fieldDefs: fieldDef.of.typeDef.fieldDefs,
        typeName: '__UNNAMED__',
        schemaDef,
        options,
      })
    case 'boolean':
    case 'enum':
    case 'reference':
    case 'string':
      return rawItemData
    default:
      return casesHandled(fieldDef.of)
  }
}

const getComputedValues = async ({
  doc,
  documentDef,
}: {
  documentDef: Core.DocumentTypeDef
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
