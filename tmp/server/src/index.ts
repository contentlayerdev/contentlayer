import * as Core from '@contentlayer/core'
import { json } from 'body-parser'
import { graphql } from 'graphql'
import { makeSchema } from 'nexus'
import * as polka from 'polka'

export const server = async ({ schemaDef }: { schemaDef: Core.SchemaDef }) => {
  const { PORT = 3088 } = process.env

  const types = makeGraphQLTypesForCoreSchema(schemaDef)
  const schema = makeSchema({
    types,
    shouldGenerateArtifacts: false,
  })

  const ctx = {}

  const server = polka()

  server.use(json())
  server.post('/', (req, res) => {
    let { query } = req.body
    // We could use `async` & `await` here
    // but requires Node 8.x environment to run
    graphql(schema, query, ctx).then((data) => {
      res.status(200).send(data)
    })
  })

  server.listen(PORT, (err: any) => {
    if (err) throw err
    console.log(`> Ready on localhost:${PORT}`)
  })
}

// main().catch((e) => console.error(e))

const makeGraphQLTypesForCoreSchema = (schema: Core.SchemaDef): any[] => {
  return []
}
