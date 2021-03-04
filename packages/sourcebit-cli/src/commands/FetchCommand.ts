import { Option } from 'clipanion'
import * as path from 'path'
import { getSchemaDef } from '../lib/schema'
import { BaseCommand } from './_BaseCommand'
import * as t from 'typanion'
import { promise as glob } from 'glob-promise'
import { promises as fs } from 'fs'
import matter from 'gray-matter'
import minimatch from 'minimatch'
import {
  Cache,
  SchemaDef,
  Document,
  isObjectField,
  ObjectDef,
  isListField,
  isListFieldItemsObject,
  DocumentDef,
} from '@sourcebit/sdk'
import { match } from 'ts-pattern'
import { fileExists, unwrapThunk } from '../lib/utils'
import { watch } from 'chokidar'

export class FetchCommand extends BaseCommand {
  static paths = [['fetch']]

  content = Option.String('--content,-c', {
    required: true,
    validator: t.isString(),
  })

  cachePath = Option.String('--cache', {
    required: true,
    validator: t.isString(),
  })

  watch = Option.Boolean('--watch,-w', {})

  async execute() {
    const schemaDef = await getSchemaDef({ schemaPath: this.schemaPath })
    const filePaths = await glob(this.content)

    console.log(`Found ${filePaths.length} content files.`)

    if (this.watch) {
      watch(filePaths).on('change', async () => {
        await fetch({ filePaths, schemaDef, cachePath: this.cachePath })
      })
    } else {
      await fetch({ filePaths, schemaDef, cachePath: this.cachePath })
    }
  }
}

async function fetch({
  filePaths,
  schemaDef,
  cachePath,
}: {
  filePaths: string[]
  schemaDef: SchemaDef
  cachePath: string
}) {
  const documents = await Promise.all(
    filePaths.map((filePath) => parseContent({ filePath, schemaDef })),
  )

  const cache: Cache = { documents }

  const cacheFilePath = path.join(process.cwd(), cachePath)

  if (await fileExists(cacheFilePath)) {
    await fs.unlink(cacheFilePath)
  }
  await fs.writeFile(cacheFilePath, JSON.stringify(cache, null, 2))

  console.log(`Data cache file successfully written to ${cacheFilePath}`)
}

function checkSchema({
  schemaDef,
  content,
  filePath,
}: {
  schemaDef: SchemaDef
  content: Content
  filePath: string
}): void {
  const documentDef = schemaDef.documents.find((_) =>
    minimatch(filePath, _.filePathPattern),
  )

  if (documentDef === undefined) {
    throw new Error(`No matching document definition found for "${filePath}"`)
  }

  const fieldDefs = unwrapThunk(documentDef.fields)

  const existingFieldKeys = Object.keys(content.data)

  // make sure all required fields are present
  const requiredFields = fieldDefs.filter((_) => _.required)
  const misingRequiredFields = requiredFields.filter(
    (fieldDef) => !existingFieldKeys.includes(fieldDef.name),
  )
  if (misingRequiredFields.length > 0) {
    throw new Error(
      `Missing required fields (type: "${
        documentDef.name
      }") for "${filePath}":\n${misingRequiredFields
        .map((_, i) => `${i + 1}: ` + JSON.stringify(_))
        .join('\n')}`,
    )
  }

  // TODO make sure all properties match field defs

  // TODO validate objects
}

type Content = ContentMarkdown | ContentJSON
type ContentMarkdown = {
  readonly kind: 'markdown'
  data: Record<string, any> & { __content: string }
}
type ContentJSON = {
  readonly kind: 'json'
  data: Record<string, any>
}

async function parseContent({
  filePath,
  schemaDef,
}: {
  filePath: string
  schemaDef: SchemaDef
}): Promise<Document> {
  const fileContent = await fs.readFile(filePath, 'utf-8')
  const filePathExtension = filePath.toLowerCase().split('.').pop()
  const content = match<string | undefined, Content>(filePathExtension)
    .with('md', () => {
      const markdown = matter(fileContent)
      return {
        kind: 'markdown',
        data: { ...markdown.data, __content: markdown.content },
      }
    })
    .with('json', () => ({ kind: 'json', data: JSON.parse(fileContent) }))
    .otherwise(() => {
      throw new Error(
        `Unsupported file extension "${filePathExtension}" for ${filePath}`,
      )
    })

  checkSchema({ content, schemaDef, filePath })

  const documentDef = schemaDef.documents.find((_) =>
    minimatch(filePath, _.filePathPattern),
  )!

  // add __meta.TypeName to embedded objects
  unwrapThunk(documentDef.fields)
    .filter(isObjectField)
    .forEach((_) => {
      addMetaToData({
        dataRef: content.data,
        fieldName: _.name,
        objectDef: unwrapThunk(_.object),
        isArray: false,
      })
    })

  // TODO clean up polymorphic union tags
  // unwrapThunk(documentDef.fields)
  //   .filter(isListField)
  //   .forEach((_) => {
  //     // const items = _.items
  //     if (isListFieldItemsObject(_.items)) {

  //     }
  //   })

  // TOOD add meta data to objects in array as well

  const doc: Document = {
    ...content.data,
    __meta: { sourceFilePath: filePath, typeName: documentDef.name },
  }

  const computedValues = getComputedValues({ documentDef, doc })
  if (computedValues) {
    doc.__computed = computedValues
  }

  return doc
}

function addMetaToData({
  dataRef,
  objectDef,
  fieldName,
  isArray,
}: {
  dataRef: any
  objectDef: ObjectDef
  fieldName: string
  isArray: boolean
}): void {
  if (isArray) {
    dataRef[fieldName].forEach(
      (item: any) => (item.__meta = { typeName: objectDef.name }),
    )
  } else {
    dataRef[fieldName].__meta = { typeName: objectDef.name }
  }

  unwrapThunk(objectDef.fields)
    .filter(isObjectField)
    .forEach((_) =>
      addMetaToData({
        dataRef: dataRef[fieldName],
        fieldName: _.name,
        objectDef: unwrapThunk(_.object),
        isArray: false,
      }),
    )
}

function getComputedValues({
  doc,
  documentDef,
}: {
  documentDef: DocumentDef
  doc: Document
}): undefined | Record<string, any> {
  if (documentDef.computedFields === undefined) {
    return undefined
  }

  const computedFields = documentDef.computedFields((_) => _)
  const computedValues = computedFields.reduce((acc, field) => {
    acc[field.name] = field.resolve(doc)
    return acc
  }, {} as any)

  return computedValues
}
