import { Option } from 'clipanion'
import * as path from 'path'
import { getSchemaDef } from '../lib/schema'
import { BaseCommand } from './_BaseCommand'
import * as t from 'typanion'
import { promise as glob } from 'glob-promise'
import { promises as fs } from 'fs'
import matter from 'gray-matter'
import minimatch from 'minimatch'
import { Cache, SchemaDef, Document } from '@sourcebit/sdk'
import { match } from 'ts-pattern'
import { unwrapThunk } from '../lib/utils'

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

  async execute() {
    const schemaDef = await getSchemaDef({ schemaPath: this.schemaPath })
    const filePaths = await glob(this.content)

    console.log(`Found ${filePaths.length} content files.`)

    const documents = await Promise.all(
      filePaths.map((filePath) => parseContent({ filePath, schemaDef })),
    )

    const cache: Cache = { documents }

    const cacheFilePath = path.join(process.cwd(), this.cachePath)
    await fs.writeFile(cacheFilePath, JSON.stringify(cache, null, 2))

    console.log(`Data cache file successfully written to ${cacheFilePath}`)
  }
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
  )

  return {
    ...content.data,
    __meta: { sourceFilePath: filePath, typeName: documentDef!.name },
  }
}
