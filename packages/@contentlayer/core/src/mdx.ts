import { OT, pipe, T, Tagged } from '@contentlayer/utils/effect'
import * as mdxBundler from 'mdx-bundler'
import type { BundleMDXOptions } from 'mdx-bundler/dist/types'

import type { MarkdownOptions } from './plugin.js'

export const bundleMDX = ({
  mdxString,
  options,
}: {
  mdxString: string
  options?: MarkdownOptions
}): T.Effect<OT.HasTracer, UnexpectedMDXError, string> =>
  pipe(
    T.gen(function* ($) {
      // TODO should be fixed in `mdx-bundler`
      if (mdxString.length === 0) {
        return ''
      }

      const mdxOptions: BundleMDXOptions = {
        xdmOptions: (opts) => {
          opts.rehypePlugins = [...(opts.rehypePlugins ?? []), ...(options?.rehypePlugins ?? [])]
          opts.remarkPlugins = [...(opts.remarkPlugins ?? []), ...(options?.remarkPlugins ?? [])]
          return opts
        },
      }

      const res = yield* $(T.tryPromise(() => mdxBundler.bundleMDX(mdxString, mdxOptions)))

      if (res.errors.length > 0) {
        return yield* $(T.fail(new UnexpectedMDXError({ error: res.errors })))
      }

      return res.code
    }),
    T.catchAllDefect(T.fail),
    T.mapError((error) => new UnexpectedMDXError({ error })),
    OT.withSpan('@contentlayer/core/markdown:bundleMDX'),
  )

export class UnexpectedMDXError extends Tagged('UnexpectedMDXError')<{ readonly error: unknown }> {}
