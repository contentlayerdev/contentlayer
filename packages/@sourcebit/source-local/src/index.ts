import { Observable, SourcePlugin } from '@sourcebit/core'
import * as chokidar from 'chokidar'
import { promise as glob } from 'glob-promise'
import * as path from 'path'
import { fetch, FilePathPatternMap } from './fetchData'
import { makeCoreSchema } from './provideSchema'
import { DocumentDef, Thunk } from './schema'

export * from './schema'

type MakeSourcePlugin = (_: { documentDefs: Thunk<DocumentDef>[]; contentDirPath: string }) => SourcePlugin

export const makeSourcePlugin: MakeSourcePlugin = ({ documentDefs: documentDefs_, contentDirPath }) => {
  const documentDefs = documentDefs_.map((_) => _())
  return {
    provideSchema: () => makeCoreSchema({ documentDefs }),
    fetchData: async ({ watch }) => {
      const schemaDef = makeCoreSchema({ documentDefs })
      const filePathPatternMap: FilePathPatternMap = documentDefs.reduce(
        (acc, documentDef) => ({ ...acc, [documentDef.name]: documentDef.filePathPattern }),
        {},
      )

      return new Observable((observer) => {
        fetch({ schemaDef, filePathPatternMap, contentDirPath }).then((_) => {
          observer.next(_)

          if (!watch) {
            observer.complete()
          }
        })

        Promise.all(documentDefs.map((_) => glob(path.join(contentDirPath, _.filePathPattern)))).then((filePaths_) => {
          const filePaths = filePaths_.flat()
          if (watch) {
            chokidar.watch(filePaths).on('change', () => {
              fetch({ schemaDef, filePathPatternMap, contentDirPath }).then((_) => {
                observer.next(_)
              })
            })
          }
        })
      })
    },
  }
}
