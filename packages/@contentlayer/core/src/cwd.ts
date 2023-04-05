import type { AbsolutePosixFilePath } from '@contentlayer/utils'
import { unknownToAbsolutePosixFilePath } from '@contentlayer/utils'
import type { Has } from '@contentlayer/utils/effect'
import { T, tag } from '@contentlayer/utils/effect'

export const makeCwd = T.gen(function* (_) {
  const cwd = yield* _(
    T.succeedWith(() => {
      const cwdValue = process.env.PWD ?? process.cwd()
      return unknownToAbsolutePosixFilePath(cwdValue)
    }),
  )

  return { cwd } as const
})

export interface Cwd extends T.OutputOf<typeof makeCwd> {}
export const Cwd = tag<Cwd>(Symbol('contentlayer:Cwd'))

export const provideCwd = T.provideServiceM(Cwd)(makeCwd)

export const provideCwdCustom = (cwd: AbsolutePosixFilePath) => T.provideService(Cwd)({ cwd } as const)

export const getCwd = T.accessService(Cwd)((_) => _.cwd)

export type HasCwd = Has<Cwd>
