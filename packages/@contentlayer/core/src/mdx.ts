import { errorToString } from '@contentlayer/utils'
import { OT, pipe, T, Tagged } from '@contentlayer/utils/effect'
import * as mdxBundler from 'mdx-bundler'
import type { BundleMDXOptions } from 'mdx-bundler/dist/types'

import type { MDXOptions } from './plugin.js'

export const bundleMDX = ({
  mdxString,
  options,
}: {
  mdxString: string
  options?: MDXOptions
}): T.Effect<OT.HasTracer, UnexpectedMDXError, string> =>
  pipe(
    T.gen(function* ($) {
      // TODO should be fixed in `mdx-bundler`
      if (mdxString.length === 0) {
        return ''
      }
      const { rehypePlugins, remarkPlugins, ...restOptions } = options ?? {}

      const mdxOptions: BundleMDXOptions = {
        xdmOptions: (opts) => {
          opts.rehypePlugins = [...(opts.rehypePlugins ?? []), ...(rehypePlugins ?? [])]
          opts.remarkPlugins = [...(opts.remarkPlugins ?? []), ...(remarkPlugins ?? [])]
          return opts
        },
        ...restOptions,
      }

      const res = yield* $(T.tryPromise(() => mdxBundler.bundleMDX(mdxString, mdxOptions)))

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
