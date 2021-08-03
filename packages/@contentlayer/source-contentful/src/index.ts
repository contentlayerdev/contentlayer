import type { SourcePlugin } from '@contentlayer/core'
import { createClient } from 'contentful-management'
import type { Observable } from 'rxjs'
import { from, interval, of } from 'rxjs'
import { mergeMap, startWith } from 'rxjs/operators'

import { fetchAllDocuments } from './fetchData'
import { provideSchema } from './provideSchema'
import type * as SchemaOverrides from './schemaOverrides'
import type { Contentful } from './types'

export type { RawDocumentData } from './types'

type MakeSourcePlugin = (_: {
  accessToken: string
  spaceId: string
  environmentId?: string
  /**
   * Since Contentful only provides one kind of content types this schema overrides argument allows you
   * to turn relations into embedded objects. Either provide an array of type names via `objectTypes` or `documentTypes`.
   * By default all Contentful content types are treated as document types.
   *
   * In case a type name has be re-mapped using `typeNameMapping` please use your choosen type name
   */
  schemaOverrides?: SchemaOverrides.Input.SchemaOverrides
}) => SourcePlugin

export const makeSourcePlugin: MakeSourcePlugin = ({
  accessToken,
  spaceId,
  environmentId = 'master',
  schemaOverrides = {},
}) => ({
  type: 'contentful',
  extensions: {},
  provideSchema: async () => {
    const environment = await getEnvironment({ accessToken, spaceId, environmentId })
    return provideSchema({ environment, schemaOverrides })
  },
  fetchData: ({ watch }) => {
    const updates$ = watch ? getUpdateEvents().pipe(startWith(0)) : of(0)
    const data$ = from(getEnvironment({ accessToken, spaceId, environmentId })).pipe(
      mergeMap(async (environment) => ({
        environment,
        schemaDef: await provideSchema({ environment, schemaOverrides }),
      })),
      mergeMap(({ environment, schemaDef }) => fetchAllDocuments({ schemaDef, environment, schemaOverrides })),
    )

    return updates$.pipe(mergeMap(() => data$))
  },
})

const getEnvironment = async ({
  accessToken,
  spaceId,
  environmentId,
}: {
  accessToken: string
  spaceId: string
  environmentId: string
}): Promise<Contentful.Environment> => {
  const client = createClient({ accessToken })
  const space = await client.getSpace(spaceId)
  return space.getEnvironment(environmentId)
}

// TODO remove polling and implement "properly"
const getUpdateEvents = (): Observable<any> => interval(5_000)
