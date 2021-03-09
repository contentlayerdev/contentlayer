import { Cache, Observable, SourcePlugin } from '@sourcebit/core'
import * as chokidar from 'chokidar'
import { promise as glob } from 'glob-promise'
import { fetch } from './fetchData'
import { makeStaticSchema } from './provideSchema'
import { DocumentDef } from './schema'

export * from './schema'

type MakeSourcePlugin = (_: { documentDefs: DocumentDef[]; contentGlob: string }) => SourcePlugin
export const makeSourcePlugin: MakeSourcePlugin = ({ documentDefs, contentGlob }) => ({
  provideSchema: () => makeStaticSchema({ documentDefs }),
  fetchData: async ({ watch }) => {
    const filePaths = await glob(contentGlob)
    return new Observable<Cache>((observer) => {
      if (watch) {
        chokidar.watch(filePaths).on('change', () => {
          fetch({ schemaDef: { documentDefs }, filePaths }).then((cache) => observer.next(cache))
        })
      } else {
        fetch({ schemaDef: { documentDefs }, filePaths }).then((cache) => {
          observer.next(cache)
          observer.complete()
        })
      }
    })
  },
})
