import { generateDotpkg, getConfigWatch } from '@contentlayer/core'
import { switchMap, tap } from 'rxjs/operators'

import { BaseCommand } from './_BaseCommand'

export class DevCommand extends BaseCommand {
  static paths = [['dev']]

  async executeSafe() {
    getConfigWatch({
      configPath: this.configPath,
      cwd: process.cwd(),
    })
      .pipe(
        tap({ next: () => console.log(`Contentlayer config change detected. Updating type definitions and data...`) }),
        switchMap((source) => generateDotpkg({ source, watchData: true })),
        tap({ next: () => console.log(`Generated node_modules/.contentlayer`) }),
      )
      .subscribe()
  }
}
