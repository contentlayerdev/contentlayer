import type * as Core from '@sourcebit/core'
import { promises as fs } from 'fs'
import { promise as glob } from 'glob-promise'
import matter from 'gray-matter'
import * as yaml from 'js-yaml'
import * as path from 'path'
import { match } from 'ts-pattern'
// import { DocumentDef, isObjectField, ObjectDef, SchemaDef } from './schema'
// import { unwrapThunk } from './utils'

type DocumentDefName = string
type FilePathPattern = string
export type FilePathPatternMap = Record<DocumentDefName, FilePathPattern>

export async function fetch({
  schemaDef,
  filePathPatternMap,
  contentDirPath,
}: {
  schemaDef: Core.SchemaDef
  filePathPatternMap: FilePathPatternMap
  contentDirPath: string
}): Promise<{ documents: Core.Document[] }> {
  const documentDefNameWithFilePathsTuples = await Promise.all(
    Object.entries(filePathPatternMap).map<Promise<[string, string[]]>>(async ([documentDefName, filePathPattern]) => [
      documentDefName,
      await glob(path.join(contentDirPath, filePathPattern)),
    ]),
  )

  const documents = await Promise.all(
    documentDefNameWithFilePathsTuples.flatMap(([documentDefName, filePaths]) =>
      filePaths.map((filePath) => makeDocumentFromFilePath({ filePath, schemaDef, documentDefName, contentDirPath })),
    ),
  )

  return { documents }
}

type Content = ContentMarkdown | ContentJSON
type ContentMarkdown = {
  readonly kind: 'markdown'
  data: Record<string, any> & { content: string }
}
type ContentJSON = {
  readonly kind: 'json'
  data: Record<string, any>
}

async function makeDocumentFromFilePath({
  filePath,
  schemaDef,
  documentDefName,
  contentDirPath,
}: {
  filePath: string
  schemaDef: Core.SchemaDef
  documentDefName: string
  contentDirPath: string
}): Promise<Core.Document> {
  const fileContent = await fs.readFile(filePath, 'utf-8')
  const filePathExtension = filePath.toLowerCase().split('.').pop()
  const content = match<string | undefined, Content>(filePathExtension)
    .with('md', () => {
      const markdown = matter(fileContent)
      return {
        kind: 'markdown',
        data: { ...markdown.data, content: markdown.content },
      }
    })
    .with('json', () => ({ kind: 'json', data: JSON.parse(fileContent) }))
    .when(
      (_) => ['yaml', 'yml'].includes(_ ?? ''),
      () => ({ kind: 'json', data: yaml.load(fileContent) as object }),
    )
    .otherwise(() => {
      throw new Error(`Unsupported file extension "${filePathExtension}" for ${filePath}`)
    })

  checkSchema({ content, filePath, documentDefName, schemaDef })

  const documentDef = schemaDef.documentDefMap[documentDefName]

  // add __meta.TypeName to embedded objects
  // documentDef.fieldDefs.filter(isObjectFieldDef).forEach((fieldDef) => {
  //   addMetaToDataRec({
  //     dataRef: content.data,
  //     fieldDef,
  //     isArray: false,
  //     schemaDef,
  //   })
  // })

  // TOOD add meta data to objects in array as well

  const re = new RegExp(`^${contentDirPath}(\/)?`)
  const sourceFilePath = filePath.replace(re, '')

  const doc = makeDocument({ documentDef, rawContent: content, schemaDef, sourceFilePath })

  const computedValues = getComputedValues({ documentDef, doc })
  if (computedValues) {
    Object.entries(computedValues).forEach(([fieldName, value]) => {
      doc[fieldName] = value
    })
  }

  return doc
}

function checkSchema({
  schemaDef,
  content,
  filePath,
  documentDefName,
}: {
  schemaDef: Core.SchemaDef
  content: Content
  filePath: string
  documentDefName: string
}): Core.DocumentDef {
  const documentDef = schemaDef.documentDefMap[documentDefName]

  if (documentDef === undefined) {
    throw new Error(`No matching document definition found for "${filePath}"`)
  }

  const existingDataFieldKeys = Object.keys(content.data)

  // make sure all required fields are present
  const requiredFields = documentDef.fieldDefs.filter((_) => _.required)
  const misingRequiredFields = requiredFields.filter((fieldDef) => !existingDataFieldKeys.includes(fieldDef.name))
  if (misingRequiredFields.length > 0) {
    throw new Error(
      `Missing required fields (type: "${documentDef.name}") for "${filePath}":\n${misingRequiredFields
        .map((_, i) => `${i + 1}: ` + JSON.stringify(_))
        .join('\n')}`,
    )
  }

  // TODO validate objects

  return documentDef
}

const makeDocument = ({
  rawContent,
  documentDef,
  schemaDef,
  sourceFilePath,
}: {
  rawContent: Content
  documentDef: Core.DocumentDef
  schemaDef: Core.SchemaDef
  sourceFilePath: string
}): Core.Document => {
  const doc: Core.Document = {
    _typeName: documentDef.name,
    _id: sourceFilePath,
    _raw: { sourceFilePath, kind: rawContent.kind },
  }

  documentDef.fieldDefs.forEach((fieldDef) => {
    doc[fieldDef.name] = getDataForFieldDef({
      fieldDef,
      rawFieldData: rawContent.data[fieldDef.name],
      schemaDef,
    })
  })

  return doc
}

const makeObject = ({
  rawObjectData,
  fieldDefs,
  typeName,
  schemaDef,
}: {
  rawObjectData: Record<string, any>
  /** Passing `FieldDef[]` here instead of `ObjectDef` in order to also support `inline_object` */
  fieldDefs: Core.FieldDef[]
  typeName: string
  schemaDef: Core.SchemaDef
}): Core.Object => {
  const raw = Object.fromEntries(Object.entries(rawObjectData).filter(([key]) => key.startsWith('_')))
  const obj: Core.Object = { _typeName: typeName, _raw: raw }

  fieldDefs.forEach((fieldDef) => {
    obj[fieldDef.name] = getDataForFieldDef({
      fieldDef,
      rawFieldData: rawObjectData[fieldDef.name],
      schemaDef,
    })
  })

  return obj
}

const getDataForFieldDef = ({
  fieldDef,
  rawFieldData,
  schemaDef,
}: {
  fieldDef: Core.FieldDef
  rawFieldData: any
  schemaDef: Core.SchemaDef
}): any => {
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
      })
    case 'inline_object':
      return makeObject({
        rawObjectData: rawFieldData,
        fieldDefs: fieldDef.fieldDefs,
        typeName: 'inline_object',
        schemaDef,
      })
    case 'reference':
      return rawFieldData
    case 'polymorphic_list':
    case 'list':
      return (rawFieldData as any[]).map((rawItemData) => getDataForListItem({ rawItemData, fieldDef, schemaDef }))
    default:
      return rawFieldData
  }
}

const getDataForListItem = ({
  rawItemData,
  fieldDef,
  schemaDef,
}: {
  rawItemData: any
  fieldDef: Core.ListFieldDef | Core.PolymorphicListFieldDef
  schemaDef: Core.SchemaDef
}): any => {
  if (typeof rawItemData === 'string') {
    return rawItemData
  }

  if (fieldDef.type === 'polymorphic_list') {
    const objectTypeName = rawItemData[fieldDef.typeField]
    const objectDef = schemaDef.objectDefMap[objectTypeName]
    return makeObject({
      rawObjectData: rawItemData,
      fieldDefs: objectDef.fieldDefs,
      typeName: objectDef.name,
      schemaDef,
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
      })
    case 'inline_object':
      return makeObject({
        rawObjectData: rawItemData,
        fieldDefs: fieldDef.of.fieldDefs,
        typeName: 'inline_object',
        schemaDef,
      })
    default:
      return rawItemData
  }
}

function getComputedValues({
  doc,
  documentDef,
}: {
  documentDef: Core.DocumentDef
  doc: Document
}): undefined | Record<string, any> {
  if (documentDef.computedFields === undefined) {
    return undefined
  }

  const computedValues = documentDef.computedFields.reduce((acc, field) => {
    acc[field.name] = field.resolve(doc)
    return acc
  }, {} as any)

  return computedValues
}
