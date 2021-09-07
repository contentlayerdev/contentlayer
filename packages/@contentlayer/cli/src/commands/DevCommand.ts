import { generateDotpkg, getConfigWatch } from '@contentlayer/core'
import { pipe } from '@effect-ts/core'
import * as T from '@effect-ts/core/Effect'
import * as S from '@effect-ts/core/Effect/Experimental/Stream'
import { firstValueFrom } from 'rxjs'

import { BaseCommand } from './_BaseCommand'

export class DevCommand extends BaseCommand {
  static paths = [['dev']]

  // async executeSafe() {
  //   getConfigWatch({
  //     configPath: this.configPath,
  //     cwd: process.cwd(),
  //   })
  //     .pipe(
  //       tapSkipFirst(() => console.log(`Contentlayer config change detected. Updating type definitions and data...`)),
  //       switchMap((source) => generateDotpkg({ source, watchData: true })),
  //       tap(() => console.log(`Generated node_modules/.contentlayer`)),
  //     )
  //     .subscribe()
  // }

  executeSafe = () =>
    pipe(
      getConfigWatch({
        configPath: this.configPath,
        cwd: process.cwd(),
      }),
      S.tap(() => log(`Contentlayer config change detected. Updating type definitions and data...`)),
      S.mapEff((source) => T.tryPromise(() => firstValueFrom(generateDotpkg({ source, watchData: true })))),
      S.tap(() => log(`Generated node_modules/.contentlayer`)),
      S.runDrain,
    )
}

const log = (...args: any[]) =>
  T.succeedWith(() => {
    console.log(...args)
  })
