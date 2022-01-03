import { unknownToPosixFilePath } from '@contentlayer/utils'
import type { Has } from '@contentlayer/utils/effect'
import { T, tag } from '@contentlayer/utils/effect'

const CwdSymbol = Symbol()

export const makeCwd = T.gen(function* (_) {
  const cwd = yield* _(
    T.succeedWith(() => {
      // `process.env.INIT_CWD` is set by `yarn` or `npm` during installation
      const cwdValue = process.env.INIT_CWD ?? process.cwd()
      return unknownToPosixFilePath(cwdValue)
    }),
  )

  return { serviceId: CwdSymbol, cwd } as const
})

export interface Cwd extends T.OutputOf<typeof makeCwd> {}
export const Cwd = tag<Cwd>()

export const provideCwd = T.provideServiceM(Cwd)(makeCwd)

export const getCwd = T.accessService(Cwd)((_) => _.cwd)

export type HasCwd = Has<Cwd>
