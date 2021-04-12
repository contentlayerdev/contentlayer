import { switchMap, tap } from 'rxjs/operators'
import { fetchDataAndCache } from '../commands/cache-data'
import { generateTypes } from '../commands/generate-types'
import { getConfigWatch } from '../getConfig'

export const watch = ({ configPath, onContentChange }: { configPath: string; onContentChange?: () => void }) => {
  getConfigWatch({
    configPath,
    cwd: process.cwd(),
  })
    .pipe(
      tap((config) => generateTypes({ config })),
      tap(() => console.log('new config')),
      switchMap((config) => fetchDataAndCache({ config, watch: true })),
      tap(onContentChange),
      tap(() => console.log('content change')),
    )
    .subscribe()

  // .subscribe((config) => {
  //   console.log('new config')

  //   config.source.watchDataChange().subscribe(onContentChange)
  //   generateTypes({ config })
  // })
}
