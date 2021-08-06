import * as core from '@contentlayer/core'
import * as utils from '@contentlayer/utils'
import { promises as fs } from 'fs'
import { promise as glob } from 'glob-promise'
import matter from 'gray-matter'
import * as yaml from 'js-yaml'
import minimatch from 'minimatch'
import * as os from 'os'
import * as path from 'path'

import type { Flags } from '.'
import type { DocumentBodyType } from './schema'
import type { FilePathPatternMap, RawDocumentData } from './types'

export const fetchAllDocuments = (async ({
  coreSchemaDef,
  filePathPatternMap,
  contentDirPath,
  flags,
  options,
  previousCache,
}: {
  coreSchemaDef: core.SchemaDef
  filePathPatternMap: FilePathPatternMap
  contentDirPath: string
  flags: Flags
  options: core.PluginOptions
  previousCache: core.Cache | undefined
}): Promise<core.Cache> => {
  const allRelativeFilePaths = await getAllRelativeFilePaths({ contentDirPath })

  const concurrencyLimit = os.cpus().length

  const documents = await utils
    .promiseMapPool(
      allRelativeFilePaths,
      (relativeFilePath) =>
        makeCacheItemFromFilePath({
          relativeFilePath,
          filePathPatternMap,
          coreSchemaDef: coreSchemaDef,
          contentDirPath,
          flags,
          options,
          previousCache,
        }),
      concurrencyLimit,
    )
    .then((_) => _.filter(utils.isNotUndefined))

  const cacheItemsMap = Object.fromEntries(documents.map((_) => [_.document._id, _]))

  return { cacheItemsMap }
})['|>'](
  utils.traceAsyncFn('@contentlayer/source-local/fetchData:fetchAllDocuments', (_) => utils.omit(_, ['previousCache'])),
)

type RawContent = RawContentMarkdown | RawContentMDX | RawContentJSON | RawContentYAML
type RawContentMarkdown = {
  readonly kind: 'markdown'
  fields: Record<string, any>
  body: string
}
type RawContentMDX = {
  readonly kind: 'mdx'
  fields: Record<string, any>
  body: string
}
type RawContentJSON = {
  readonly kind: 'json'
  fields: Record<string, any>
}
type RawContentYAML = {
  readonly kind: 'yaml'
  fields: Record<string, any>
}

const rawContentHasBody = (_: RawContent): _ is RawContentMarkdown | RawContentMDX =>
  'body' in _ && _.body !== undefined

export const makeCacheItemFromFilePath = (async ({
  relativeFilePath,
  filePathPatternMap,
  coreSchemaDef,
  contentDirPath,
  flags,
  options,
  previousCache,
}: {
  relativeFilePath: string
  filePathPatternMap: FilePathPatternMap
  coreSchemaDef: core.SchemaDef
  contentDirPath: string
  flags: Flags
  options: core.PluginOptions
  previousCache: core.Cache | undefined
}): Promise<core.CacheItem | undefined> => {
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

  const fileContent = await fs.readFile(fullFilePath, 'utf-8')
  const filePathExtension = relativeFilePath.toLowerCase().split('.').pop()

  const rawContent = utils.pattern
    .match<string | undefined, RawContent>(filePathExtension)
    .with('md', () => {
      const markdown = matter(fileContent)
      return { kind: 'markdown', fields: markdown.data, body: markdown.content }
    })
    .with('mdx', () => {
      const markdown = matter(fileContent)
      return { kind: 'mdx', fields: markdown.data, body: markdown.content }
    })
    .with('json', () => ({ kind: 'json', fields: JSON.parse(fileContent) }))
    .when(
      (_) => _ === 'yaml' || _ === 'yml',
      () => ({ kind: 'yaml', fields: yaml.load(fileContent) as any }),
    )
    .otherwise(() => {
      throw new Error(`Unsupported file extension "${filePathExtension}" for ${relativeFilePath}`)
    })

  const documentDefName = getDocumentDefNameOrThrow({ rawContent, filePathPatternMap, relativeFilePath, options })

  if (utils.isUndefined(documentDefName)) {
    const typeFieldName = options.fieldOptions.typeFieldName

    const message = `\
Couldn't find document type definition for file "${relativeFilePath}"

Please either provide a valid value for the type field ("${typeFieldName}")
or define a filePathPattern for the given document type definition.
`

    switch (flags.onMissingOrIncompatibleData) {
      case 'skip':
        console.log(`Skipping document. Reason: ${message}`)
        return undefined
      case 'skip-ignore':
        return undefined
      case 'fail':
        throw new Error(`Error: ${message}`)
    }
  }

  const isValid = validateDocumentData({ rawContent, relativeFilePath, documentDefName, coreSchemaDef, flags, options })
  if (!isValid) {
    return undefined
  }

  const documentTypeDef = coreSchemaDef.documentTypeDefMap[documentDefName]

  const document = await makeDocument({
    documentTypeDef,
    rawContent,
    coreSchemaDef,
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
  utils.traceAsyncFn('@contentlayer/source-local/fetchData:makeDocumentFromFilePath', (_) =>
    utils.omit(_, ['previousCache']),
  ),
)

const validateDocumentData = ({
  coreSchemaDef,
  rawContent,
  relativeFilePath,
  documentDefName,
  flags,
  options,
}: {
  coreSchemaDef: core.SchemaDef
  rawContent: RawContent
  /** relativeFilePath just needed for better error handling */
  relativeFilePath: string
  documentDefName: string
  flags: Flags
  options: core.PluginOptions
}): boolean => {
  const documentTypeDef = coreSchemaDef.documentTypeDefMap[documentDefName]

  if (documentTypeDef === undefined) {
    throw new Error(`No matching document definition found for "${relativeFilePath}"`)
  }

  const existingDataFieldKeys = Object.keys(rawContent.fields)

  // make sure all required fields are present
  const requiredFieldsWithoutDefaultValue = documentTypeDef.fieldDefs.filter(
    (_) => _.isRequired && _.default === undefined && _.isSystemField === false,
  )
  const misingRequiredFieldDefs = requiredFieldsWithoutDefaultValue.filter(
    (fieldDef) => !existingDataFieldKeys.includes(fieldDef.name),
  )
  if (misingRequiredFieldDefs.length > 0) {
    const misingRequiredFieldsStr = misingRequiredFieldDefs
      .map((fieldDef, i) => `     ${i + 1}) ${fieldDef.name}: ${fieldDef.type}`)
      .join('\n')

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
    const typeFieldName = options.fieldOptions.typeFieldName
    // add the type name field to the list of existing data fields
    const schemaFieldNames = documentTypeDef.fieldDefs.map((_) => _.name).concat([typeFieldName])
    const extraFieldKeys = existingDataFieldKeys.filter((fieldKey) => !schemaFieldNames.includes(fieldKey))
    if (extraFieldKeys.length > 0) {
      console.log(`\
Warning: Document (type: "${
        documentTypeDef.name
      }") contained fields that are not defined in schema for "${relativeFilePath}".

Extra fields:
${extraFieldKeys.map((key) => `  ${key}: ${JSON.stringify(rawContent.fields[key])}`).join('\n')}
`)
    }
  }

  // TODO validate nesteds

  return true
}

const makeDocument = async ({
  rawContent,
  documentTypeDef,
  coreSchemaDef,
  relativeFilePath,
  options,
}: {
  rawContent: RawContent
  documentTypeDef: core.DocumentTypeDef
  coreSchemaDef: core.SchemaDef
  relativeFilePath: string
  options: core.PluginOptions
}): Promise<core.Document> => {
  const { bodyFieldName, typeFieldName } = options.fieldOptions
  // const includeBody = documentTypeDef.fieldDefs.some(
  //   (_) => _.name === bodyFieldName && _.isSystemField,
  // )
  const body = utils.pattern
    .match(rawContent)
    .when(rawContentHasBody, (_) => _.body)
    .otherwise(() => undefined)
  // const bodyValue = includeBody ? { [bodyFieldName]: body } : {}
  const rawData = { ...rawContent.fields, [bodyFieldName]: body }
  const docValues = await utils.promiseMapToDict(
    documentTypeDef.fieldDefs,
    (fieldDef) =>
      getDataForFieldDef({
        fieldDef,
        rawFieldData: rawData[fieldDef.name],
        coreSchemaDef,
        options,
      }),
    (fieldDef) => fieldDef.name,
  )

  const bodyType: DocumentBodyType = utils.pattern
    .match(rawContent.kind)
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

  const doc: core.Document = {
    _id: relativeFilePath,
    _raw,
    [typeFieldName]: documentTypeDef.name,
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
  coreSchemaDef,
  options,
}: {
  rawObjectData: Record<string, any>
  /** Passing `FieldDef[]` here instead of `ObjectDef` in order to also support `inline_nested` */
  fieldDefs: core.FieldDef[]
  typeName: string
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
}): Promise<core.NestedDocument> => {
  const objValues = await utils.promiseMapToDict(
    fieldDefs,
    (fieldDef) =>
      getDataForFieldDef({
        fieldDef,
        rawFieldData: rawObjectData[fieldDef.name],
        coreSchemaDef,
        options,
      }),
    (fieldDef) => fieldDef.name,
  )

  const typeNameField = options.fieldOptions.typeFieldName
  const obj: core.NestedDocument = { [typeNameField]: typeName, _raw: {}, ...objValues }

  return obj
}

const getDataForFieldDef = async ({
  fieldDef,
  rawFieldData,
  coreSchemaDef,
  options,
}: {
  fieldDef: core.FieldDef
  rawFieldData: any
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
}): Promise<any> => {
  if (rawFieldData === undefined) {
    if (fieldDef.default !== undefined) {
      return fieldDef.default
    }

    if (fieldDef.isRequired && !fieldDef.isSystemField) {
      console.error(`Inconsistent data found: ${JSON.stringify(fieldDef)}`)
    }
    return undefined
  }

  switch (fieldDef.type) {
    case 'nested': {
      const nestedTypeDef = coreSchemaDef.nestedTypeDefMap[fieldDef.nestedTypeName]
      return makeNestedDocument({
        rawObjectData: rawFieldData,
        fieldDefs: nestedTypeDef.fieldDefs,
        typeName: nestedTypeDef.name,
        coreSchemaDef,
        options,
      })
    }
    case 'nested_unnamed':
      return makeNestedDocument({
        rawObjectData: rawFieldData,
        fieldDefs: fieldDef.typeDef.fieldDefs,
        typeName: '__UNNAMED__',
        coreSchemaDef,
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

      const nestedTypeDef = coreSchemaDef.nestedTypeDefMap[typeName]!

      return makeNestedDocument({
        rawObjectData: rawFieldData,
        fieldDefs: nestedTypeDef.fieldDefs,
        typeName: nestedTypeDef.name,
        coreSchemaDef,
        options,
      })
    }
    case 'reference':
    case 'reference_polymorphic':
      return rawFieldData
    case 'list_polymorphic':
    case 'list':
      return utils.promiseMap(rawFieldData as any[], (rawItemData) =>
        getDataForListItem({ rawItemData, fieldDef, coreSchemaDef, options }),
      )
    case 'date':
      return new Date(rawFieldData)
    case 'markdown':
      return <core.Markdown>{
        raw: rawFieldData,
        html: await core.markdownToHtml({ mdString: rawFieldData, options: options?.markdown }),
      }
    case 'mdx':
      return <core.MDX>{
        raw: rawFieldData,
        code: await core.bundleMDX({ mdxString: rawFieldData, options: options?.mdx }),
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
      utils.casesHandled(fieldDef)
  }
}

const getDataForListItem = async ({
  rawItemData,
  fieldDef,
  coreSchemaDef,
  options,
}: {
  rawItemData: any
  fieldDef: core.ListFieldDef | core.ListPolymorphicFieldDef
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
}): Promise<any> => {
  if (typeof rawItemData === 'string') {
    return rawItemData
  }

  if (fieldDef.type === 'list_polymorphic') {
    const nestedTypeName = rawItemData[fieldDef.typeField]
    const nestedTypeDef = coreSchemaDef.nestedTypeDefMap[nestedTypeName]
    if (nestedTypeDef === undefined) {
      const valueTypeValues = fieldDef.of
        .filter((_): _ is core.ListFieldDefItem.ItemNested => _.type === 'nested')
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
      coreSchemaDef,
      options,
    })
  }

  switch (fieldDef.of.type) {
    case 'nested':
      const nestedTypeDef = coreSchemaDef.nestedTypeDefMap[fieldDef.of.nestedTypeName]
      return makeNestedDocument({
        rawObjectData: rawItemData,
        fieldDefs: nestedTypeDef.fieldDefs,
        typeName: nestedTypeDef.name,
        coreSchemaDef,
        options,
      })
    case 'nested_unnamed':
      return makeNestedDocument({
        rawObjectData: rawItemData,
        fieldDefs: fieldDef.of.typeDef.fieldDefs,
        typeName: '__UNNAMED__',
        coreSchemaDef,
        options,
      })
    case 'boolean':
    case 'enum':
    case 'reference':
    case 'string':
      return rawItemData
    default:
      return utils.casesHandled(fieldDef.of)
  }
}

const getComputedValues = async ({
  doc,
  documentDef,
}: {
  documentDef: core.DocumentTypeDef
  doc: core.Document
}): Promise<undefined | Record<string, any>> => {
  if (documentDef.computedFields === undefined) {
    return undefined
  }

  const computedValues = await utils.promiseMapToDict(
    documentDef.computedFields,
    (field) => field.resolve(doc),
    (field) => field.name,
  )

  return computedValues
}

const getDocumentDefNameOrThrow = ({
  rawContent,
  relativeFilePath,
  filePathPatternMap,
  options,
}: {
  rawContent: RawContent
  relativeFilePath: string
  filePathPatternMap: FilePathPatternMap
  options: core.PluginOptions
}): string | undefined => {
  const typeFieldName = options.fieldOptions.typeFieldName
  const typeFieldValue = rawContent.fields[typeFieldName]
  if (typeFieldValue !== undefined) {
    return typeFieldValue
  }

  const documentDefName = getDocumentDefNameByFilePathPattern({ filePathPatternMap, relativeFilePath })
  if (documentDefName) {
    return documentDefName
  }
}

const getDocumentDefNameByFilePathPattern = ({
  relativeFilePath,
  filePathPatternMap,
}: {
  relativeFilePath: string
  filePathPatternMap: FilePathPatternMap
}): string | undefined => {
  const matchingFilePathPattern = Object.keys(filePathPatternMap).find((filePathPattern) =>
    minimatch(relativeFilePath, filePathPattern),
  )
  if (matchingFilePathPattern) {
    return filePathPatternMap[matchingFilePathPattern]
  }

  return undefined
}

const getAllRelativeFilePaths = async ({ contentDirPath }: { contentDirPath: string }): Promise<string[]> => {
  const filePathPattern = '**/*.{md,mdx,json,yaml,yml}'
  return glob(filePathPattern, { cwd: contentDirPath })
}
