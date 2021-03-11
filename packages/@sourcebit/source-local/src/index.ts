import { Observable, SourcePlugin } from '@sourcebit/core'
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

    return new Observable((observer) => {
      fetch({ schemaDef: { documentDefs }, filePaths }).then((_) => {
        observer.next(_)

        if (!watch) {
          observer.complete()
        }
      })

      if (watch) {
        chokidar.watch(filePaths).on('change', () => {
          fetch({ schemaDef: { documentDefs }, filePaths }).then((_) => {
            observer.next(_)
          })
        })
      }
    })
  },
})
