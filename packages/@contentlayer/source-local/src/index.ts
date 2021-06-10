import type { Options, SourcePlugin } from '@contentlayer/core'
import * as chokidar from 'chokidar'
import { defer, fromEvent, of } from 'rxjs'
import { mergeMap, startWith, tap } from 'rxjs/operators'

import { fetch } from './fetchData'
import { makeCoreSchema } from './provideSchema'
import type { DocumentDef, Thunk } from './schema'
import type { FilePathPatternMap } from './types'

export * from './schema'
export * from './types'

type Args = {
  schema: Thunk<DocumentDef>[] | Record<string, Thunk<DocumentDef>>
  contentDirPath: string
} & Options &
  Partial<Flags>

export type Flags = {
  /**
   * Whether to print warning meassages if content has fields not definied in the schema
   * @default 'warn'
   */
  onExtraData: 'warn' | 'ignore'
  /**
   * Whether to skip or fail when encountering missing or incompatible data
   */
  onMissingOrIncompatibleData: 'skip' | 'fail' | 'skip-ignore'
}

type MakeSourcePlugin = (_: Args | (() => Args) | (() => Promise<Args>)) => Promise<SourcePlugin>

export const fromLocalContent: MakeSourcePlugin = async (_args) => {
  const {
    contentDirPath,
    schema: documentDefs_,
    onMissingOrIncompatibleData = 'skip',
    onExtraData = 'warn',
    ...options
  } = typeof _args === 'function' ? await _args() : _args
  const documentDefs = (Array.isArray(documentDefs_) ? documentDefs_ : Object.values(documentDefs_)).map((_) => _())

  return {
    type: 'local',
    provideSchema: () => makeCoreSchema({ documentDefs }),
    fetchData: ({ watch, force, previousCache }) => {
      const filePathPatternMap = documentDefs.reduce(
        (acc, documentDef) => ({ ...acc, [documentDef.name]: documentDef.filePathPattern }),
        {} as FilePathPatternMap,
      )
      const flags: Flags = { onExtraData, onMissingOrIncompatibleData }

      const updates$ = watch
        ? defer(() =>
            fromEvent(
              chokidar.watch(contentDirPath, {
                ignoreInitial: true,
                // Unfortunately needed in order to avoid race conditions
                awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
              }),
              'all',
            ),
          ).pipe(
            tap((e) => {
              if (e && Array.isArray(e) && e.length >= 2) {
                console.log(`Watch event "${e[0]}": ${e[1]}`)
              }
            }),
            startWith(0),
          )
        : of(0)

      const data$ = of(makeCoreSchema({ documentDefs })).pipe(
        mergeMap((schemaDef) =>
          fetch({ schemaDef, filePathPatternMap, contentDirPath, force, previousCache, flags, options }),
        ),
      )

      return updates$.pipe(mergeMap(() => data$))
    },
  }
}
