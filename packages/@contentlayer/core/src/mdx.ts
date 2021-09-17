import { OT, pipe, T, Tagged } from '@contentlayer/utils/effect'
import { bundleMDX as bundleMDX_ } from 'mdx-bundler'
import type { BundleMDXOptions } from 'mdx-bundler/dist/types'

import type { MarkdownOptions } from './plugin'

export const bundleMDX = ({
  mdxString,
  options,
}: {
  mdxString: string
  options?: MarkdownOptions
}): T.Effect<OT.HasTracer, MDXError, string> =>
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

      const res = yield* $(T.tryPromise(() => bundleMDX_(mdxString, mdxOptions)))
      return res.code
    }),
    T.mapError((error) => new MDXError({ error })),
    OT.withSpan('@contentlayer/core/markdown:bundleMDX'),
  )

export class MDXError extends Tagged('MDXError')<{ readonly error: unknown }> {}
