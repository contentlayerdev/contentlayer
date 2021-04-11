import { Observable, SourcePlugin } from '@sourcebit/core'
import * as chokidar from 'chokidar'
import { promise as glob } from 'glob-promise'
import * as path from 'path'
import { defer, fromEvent, of } from 'rxjs'
import { mergeMap, startWith } from 'rxjs/operators'
import { fetch, FilePathPatternMap } from './fetchData'
import { makeCoreSchema } from './provideSchema'
import { DocumentDef, Thunk } from './schema'

export * from './schema'

type MakeSourcePlugin = (_: {
  documentDefs: Thunk<DocumentDef>[] | Record<string, Thunk<DocumentDef>>
  contentDirPath: string
}) => SourcePlugin

export const makeSourcePlugin: MakeSourcePlugin = ({ documentDefs: documentDefs_, contentDirPath }) => {
  const documentDefs = (Array.isArray(documentDefs_) ? documentDefs_ : Object.values(documentDefs_)).map((_) => _())

  return {
    provideSchema: () => makeCoreSchema({ documentDefs }),
    fetchData: ({ watch, force, previousCache }) => {
      const schemaDef = makeCoreSchema({ documentDefs })
      const filePathPatternMap: FilePathPatternMap = documentDefs.reduce(
        (acc, documentDef) => ({ ...acc, [documentDef.name]: documentDef.filePathPattern }),
        {},
      )

      return of(0).pipe(
        mergeMap(() =>
          watch
            ? defer(() => getFilePaths({ contentDirPath, documentDefs })).pipe(
                mergeMap((filePaths) => fromEvent<void>(chokidar.watch(filePaths), 'change')),
                startWith(0),
              )
            : of(0),
        ),
        mergeMap(() => fetch({ schemaDef, filePathPatternMap, contentDirPath, force, previousCache })),
      )
    },
    watchDataChange: (): Observable<void> =>
      defer(() => getFilePaths({ contentDirPath, documentDefs })).pipe(
        mergeMap((filePaths) => fromEvent<void>(chokidar.watch(filePaths), 'change')),
      ),
  }
}

const getFilePaths = async ({
  documentDefs,
  contentDirPath,
}: {
  documentDefs: DocumentDef[]
  contentDirPath: string
}): Promise<string[]> => {
  const filePaths_ = await Promise.all(documentDefs.map((_) => glob(path.join(contentDirPath, _.filePathPattern))))
  return filePaths_.flat()
}
