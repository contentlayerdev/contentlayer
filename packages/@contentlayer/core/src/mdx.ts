import { errorToString } from '@contentlayer/utils'
import { OT, pipe, T, Tagged } from '@contentlayer/utils/effect'
import * as mdxBundler from 'mdx-bundler'
import type { BundleMDXOptions } from 'mdx-bundler/dist/types'
import * as path from 'path'

import type { MDXOptions } from './plugin.js'

export const bundleMDX = ({
  mdxString,
  options,
  contentDirPath,
}: {
  mdxString: string
  options?: MDXOptions
  contentDirPath: string
}): T.Effect<OT.HasTracer, UnexpectedMDXError, string> =>
  pipe(
    T.gen(function* ($) {
      // TODO should be fixed in `mdx-bundler`
      if (mdxString.length === 0) {
        return ''
      }
      const { rehypePlugins, remarkPlugins, cwd: cwd_, ...restOptions } = options ?? {}

      const getCwdFromContentDirPath = () =>
        // TODO don't use `process.cwd()` but instead `HasCwd`
        path.isAbsolute(contentDirPath) ? contentDirPath : path.join(process.cwd(), contentDirPath)
      const cwd = cwd_ ?? getCwdFromContentDirPath()

      const mdxOptions: BundleMDXOptions<any> = {
        xdmOptions: (opts) => {
          opts.rehypePlugins = [...(opts.rehypePlugins ?? []), ...(rehypePlugins ?? [])]
          opts.remarkPlugins = [...(opts.remarkPlugins ?? []), ...(remarkPlugins ?? [])]
          return opts
        },
        cwd,
        ...restOptions,
      }

      const res = yield* $(T.tryPromise(() => mdxBundler.bundleMDX({ source: mdxString, ...mdxOptions })))

      if (res.errors.length > 0) {
        return yield* $(T.fail(res.errors))
      }

      return res.code
    }),
    T.mapError((error) => new UnexpectedMDXError({ error })),
    OT.withSpan('@contentlayer/core/markdown:bundleMDX'),
  )

export class UnexpectedMDXError extends Tagged('UnexpectedMDXError')<{ readonly error: unknown }> {
  toString = () => `UnexpectedMDXError: ${errorToString(this.error)}`
}
