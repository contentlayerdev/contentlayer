import { GetAllTypeNamesGen, SourcePlugin } from '@contentlayer/core'
import { createClient } from 'contentful-management'
import { defer, forkJoin, from, Observable, of } from 'rxjs'
import { mergeMap, startWith } from 'rxjs/operators'
import type * as Contentful from './contentful-types'
import { fetchData } from './fetchData'
import { provideSchema } from './provideSchema'

/** 
Since Contentful only provides one kind of content types this schema overrides argument allows you
to turn relations into embedded objects. Either provide an array of type names via `objectTypes` or `documentTypes`.
*/
export type SchemaOverrides = {
  objectTypes?: GetAllTypeNamesGen[]
  documentTypes?: GetAllTypeNamesGen[]
}

type MakeSourcePlugin = (_: {
  accessToken: string
  spaceId: string
  environmentId?: string
  schemaOverrides?: SchemaOverrides
}) => SourcePlugin

export const makeSourcePlugin: MakeSourcePlugin = ({
  accessToken,
  spaceId,
  environmentId = 'master',
  schemaOverrides = {},
}) => ({
  provideSchema: async () => {
    const environment = await getEnvironment({ accessToken, spaceId, environmentId })
    return provideSchema({ environment, schemaOverrides })
  },
  fetchData: ({ watch, force, previousCache }) => {
    const updates$ = watch ? getUpdateEvents().pipe(startWith(0)) : of(0)
    const data$ = from(getEnvironment({ accessToken, spaceId, environmentId })).pipe(
      mergeMap((environment) => forkJoin([of(environment), provideSchema({ environment, schemaOverrides })])),
      mergeMap(([environment, schemaDef]) => fetchData({ schemaDef, force, previousCache, environment })),
    )

    return updates$.pipe(mergeMap(() => data$))
  },
  watchDataChange: () => getUpdateEvents(),
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

const getUpdateEvents = (): Observable<any> =>
  defer(async () => 0)
    .pipe
    // mergeMap((sanityClient) =>
    //   // `visibility: 'query'` needed otherwise event will trigger too early
    //   sanityClient.listen<MutationEvent>('*', {}, { events: ['mutation'], visibility: 'query' }),
    // ),
    ()
