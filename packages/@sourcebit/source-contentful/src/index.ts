import { SourcePlugin } from '@sourcebit/core'
import { createClient } from 'contentful-management'
import { defer, Observable, of } from 'rxjs'
import { mergeMap, startWith } from 'rxjs/operators'
import type * as Contentful from './contentful-types'
import { fetchData } from './fetchData'
import { provideSchema } from './provideSchema'

type MakeSourcePlugin = (_: { accessToken: string; spaceId: string; environmentId?: string }) => SourcePlugin

export const makeSourcePlugin: MakeSourcePlugin = ({ accessToken, spaceId, environmentId = 'master' }) => ({
  provideSchema: async () => {
    const environment = await getEnvironment({ accessToken, spaceId, environmentId })
    return provideSchema(environment)
  },
  fetchData: ({ watch, force, previousCache }) =>
    defer(() => getEnvironment({ accessToken, spaceId, environmentId })).pipe(
      mergeMap(provideSchema),
      mergeMap((schemaDef) =>
        (watch ? getUpdateEvents().pipe(startWith(0)) : of(0)).pipe(
          mergeMap(() => fetchData({ schemaDef, force, previousCache })),
        ),
      ),
    ),
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
