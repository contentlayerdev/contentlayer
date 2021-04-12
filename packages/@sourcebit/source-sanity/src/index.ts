import type { MutationEvent } from '@sanity/client'
import { SourcePlugin } from '@sourcebit/core'
import { defer, Observable, of } from 'rxjs'
import { mergeMap, startWith } from 'rxjs/operators'
import { fetchData } from './fetchData'
import { provideSchema } from './provideSchema'
import { getSanityClient } from './sanity-client'

type MakeSourcePlugin = (_: { studioDirPath: string }) => SourcePlugin

export const makeSourcePlugin: MakeSourcePlugin = ({ studioDirPath }) => ({
  provideSchema: () => provideSchema(studioDirPath),
  fetchData: ({ watch, force, previousCache }) =>
    of(studioDirPath).pipe(
      mergeMap(provideSchema),
      mergeMap((schemaDef) =>
        (watch ? getUpdateEvents(studioDirPath).pipe(startWith(0)) : of(0)).pipe(
          mergeMap(() => fetchData({ studioDirPath, schemaDef, force, previousCache })),
        ),
      ),
    ),
  watchDataChange: () => getUpdateEvents(studioDirPath),
})

const getUpdateEvents = (studioDirPath: string): Observable<any> =>
  defer(() => getSanityClient(studioDirPath)).pipe(
    mergeMap((sanityClient) =>
      // `visibility: 'query'` needed otherwise event will trigger too early
      sanityClient.listen<MutationEvent>('*', {}, { events: ['mutation'], visibility: 'query' }),
    ),
  )
