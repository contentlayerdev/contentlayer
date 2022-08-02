import * as core from '@contentlayer/core'
import type { MutationEvent } from '@sanity/client'
import { defer, from, Observable, of } from 'rxjs'
import { mergeMap, startWith } from 'rxjs/operators'

import { fetchData } from './fetchData.js'
import { provideSchema } from './provideSchema.js'
import { getSanityClient } from './sanity-client.js'
import type { PluginOptions } from './types.js'

type Args = {
  studioDirPath: string
  preview?: boolean
} & PluginOptions

export const makeSourcePlugin: core.MakeSourcePlugin<Args> = async (args) => {
  const {
    extensions,
    options,
    restArgs: { studioDirPath },
  } = await core.processArgs(args)

  return {
    type: 'sanity',
    extensions,
    options,
    provideSchema: provideSchema({ studioDirPath, options }) as any,
    fetchData: ({ watch }: any) => {
      const updates$ = watch ? getUpdateEvents(studioDirPath).pipe(startWith(0)) : of(0)
      const data$ = from(provideSchema({ studioDirPath, options })).pipe(
        mergeMap((schemaDef) => fetchData({ schemaDef, studioDirPath })),
      )

      return updates$.pipe(mergeMap(() => data$)) as any
    },
  }
}

const getUpdateEvents = (studioDirPath: string): Observable<any> =>
  defer(() => getSanityClient(studioDirPath)).pipe(
    mergeMap(
      (sanityClient) =>
        // TOOD Observable wrapping can be removed once RXJS in sanity is updated to v7
        new Observable((subscriber) => {
          // `visibility: 'query'` needed otherwise event will trigger too early
          sanityClient
            .listen<MutationEvent>('*', {}, { events: ['mutation'], visibility: 'query' })
            .subscribe(subscriber)
        }),
    ),
  )
