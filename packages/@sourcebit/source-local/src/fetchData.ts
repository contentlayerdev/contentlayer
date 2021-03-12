import type * as Core from '@sourcebit/core'
import { isObjectFieldDef } from '@sourcebit/core'
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
      filePaths.map((filePath) => parseContent({ filePath, schemaDef, documentDefName, contentDirPath })),
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

async function parseContent({
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
  documentDef.fieldDefs.filter(isObjectFieldDef).forEach((fieldDef) => {
    addMetaToDataRec({
      dataRef: content.data,
      fieldDef,
      isArray: false,
      schemaDef,
    })
  })

  // TOOD add meta data to objects in array as well

  const re = new RegExp(`^${contentDirPath}(\/)?`)
  const sourceFilePath = filePath.replace(re, '')

  console.log({ sourceFilePath, contentDirPath })

  const doc: Core.Document = {
    ...content.data,
    __meta: { sourceFilePath, typeName: documentDef.name },
  }

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

  // TODO make sure all properties match field defs

  // TODO validate objects

  return documentDef
}

function addMetaToDataRec({
  dataRef,
  fieldDef,
  isArray,
  schemaDef,
}: {
  dataRef: any
  fieldDef: Core.ObjectFieldDef
  isArray: boolean
  schemaDef: Core.SchemaDef
}): void {
  const objectDef = schemaDef.objectDefMap[fieldDef.objectName]

  if (isArray) {
    dataRef[fieldDef.name].forEach((item: any) => (item.__meta = { typeName: objectDef.name }))
  } else {
    dataRef[fieldDef.name].__meta = { typeName: objectDef.name }
  }

  objectDef.fieldDefs.filter(isObjectFieldDef).forEach((fieldDef) =>
    addMetaToDataRec({
      dataRef: dataRef[fieldDef.name],
      fieldDef,
      isArray: false,
      schemaDef,
    }),
  )
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
