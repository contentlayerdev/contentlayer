import { switchMap, tap } from 'rxjs/operators'
import { fetchDataAndCache } from '../commands/cache-data'
import { generateTypes } from '../commands/generate-types'
import { getConfigWatch } from '../getConfig'

/**
 * Watches both for config and data changes.
 * In case of config changes, it regenerates the types.
 * In case of data changes it caches the content and calls the `onContentChange` callback.
 * Also both fetches data and generates content when starting up.
 */
export const watch = ({ configPath, onContentChange }: { configPath: string; onContentChange?: () => void }) => {
  getConfigWatch({
    configPath,
    cwd: process.cwd(),
  })
    .pipe(
      tap({ next: () => console.log(`Contentlayer config change detected. Updating type definitions and data...`) }),
      tap({ next: (config) => generateTypes({ config }) }),
      switchMap((config) => fetchDataAndCache({ config, watch: true })),
      tap({ next: onContentChange }),
    )
    .subscribe()
}
