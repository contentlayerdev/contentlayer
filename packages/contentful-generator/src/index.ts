import { createClient } from 'contentful-management'
import type * as Contentful from 'contentful-management/dist/typings/export-types'
import { runMigration } from 'contentful-migration'
import { LoremIpsum } from 'lorem-ipsum'

const spaceId = 'y5crayy7d02t'
const environmentId = 'dev'
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN!

const createContentTypes = () =>
  runMigration({
    filePath: `${__dirname}/migration.ts`,
    spaceId,
    environmentId,
    accessToken,
    yes: true,
  })

const lorem = new LoremIpsum()

const createMockData = async () => {
  const environment = await getEnvironment()

  const numberOfEntriesToCreate = 13000
  for (let i = 0; i < numberOfEntriesToCreate; i++) {
    await environment.createEntry('post', {
      fields: {
        title: localized(lorem.generateWords(4)),
        // introduction: localized(richText({ numSentences: 1 })),
        introduction: localized(lorem.generateSentences(1)),
        // body: localized(richText({ numSentences: 80 })),
        body: localized(lorem.generateSentences(80)),
      },
    })
    console.log(`Created ${i} / ${numberOfEntriesToCreate} entries.`)
  }
}

const resetEnvironment = async () => {
  const environment = await getEnvironment()
  await environment.delete()

  const space = await getSpace()
  await space.createEnvironmentWithId(environmentId, { name: environmentId })
}

const localized = <T>(val: T) => ({ 'en-US': val })

const _richText = ({ numSentences }: { numSentences: number }) => ({
  content: [
    {
      nodeType: 'paragraph',
      data: {},
      content: [
        {
          value: lorem.generateSentences(numSentences),
          nodeType: 'text',
          marks: [],
          data: {},
        },
      ],
    },
  ],
  data: {},
  nodeType: 'document',
})

const getEnvironment = async (): Promise<Contentful.Environment> => {
  const space = await getSpace()
  return space.getEnvironment(environmentId)
}

const getSpace = async () => {
  const client = createClient({ accessToken })
  return client.getSpace(spaceId)
}

const main = async () => {
  const cmd = process.argv[2]

  switch (cmd) {
    case 'types': {
      await createContentTypes()
      return
    }
    case 'data':
      await createMockData()
      return
    case 'reset':
      await resetEnvironment()
      return
    default:
      throw new Error(`Unknown command ${cmd}`)
  }
}

main().catch((e) => console.error(e))
