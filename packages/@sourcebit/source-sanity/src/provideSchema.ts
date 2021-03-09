import Schema from '@sanity/schema'
import { ProvideSchemaFn } from '@sourcebit/core'
const getSanitySchema = require('@sanity/core/lib/actions/graphql/getSanitySchema')

export const provideSchema: ProvideSchemaFn = async (studioDirPath: string) => {
  const schema: Schema = getSanitySchema(studioDirPath)
  const types = schema._original.types

  // console.log({ types })
  ;(await import('fs')).promises.writeFile('schema.json', JSON.stringify(types, null, 2))

  return '' as any
}
