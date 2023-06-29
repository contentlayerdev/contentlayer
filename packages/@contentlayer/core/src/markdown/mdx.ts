import * as path from 'node:path'

import { errorToString } from '@contentlayer/utils'
import { OT, pipe, T, Tagged } from '@contentlayer/utils/effect'
import * as mdxBundler from 'mdx-bundler'
import type { BundleMDXOptions } from 'mdx-bundler/dist/types'

import type { RawDocumentData } from '../data-types.js'
import type { MDXOptions } from '../plugin.js'
import { addRawDocumentToVFile } from './unified.js'

export const bundleMDX = ({
  mdxString,
  options,
  contentDirPath,
  rawDocumentData,
}: {
  mdxString: string
  options?: MDXOptions
  contentDirPath: string
  rawDocumentData: RawDocumentData
}): T.Effect<OT.HasTracer, UnexpectedMDXError, string> =>
  pipe(
    T.gen(function* ($) {
      // TODO should be fixed in `mdx-bundler`
      if (mdxString.length === 0) {
        return ''
      }
      const {
        rehypePlugins,
        remarkPlugins,
        resolveCwd,
        cwd: cwd_,
        mdxOptions: mapMdxOptions,
        esbuildOptions: mapEsbuildOptions,
        ...restOptions
      } = options ?? {}

      const getCwdFromContentDirPath = () =>
        // TODO don't use `process.cwd()` but instead `HasCwd`
        path.isAbsolute(contentDirPath) ? contentDirPath : path.join(process.cwd(), contentDirPath)

      const getRelativeCwd = () => path.join(getCwdFromContentDirPath(), path.dirname(rawDocumentData.flattenedPath))

      const getCwd = () => (resolveCwd === 'contentDirPath' ? getCwdFromContentDirPath() : getRelativeCwd())

      // TODO when fixed https://github.com/kentcdodds/mdx-bundler/pull/206
      if (process.env.NODE_ENV === undefined) {
        process.env.NODE_ENV = 'development'
      }

      const mdxOptions: BundleMDXOptions<any> = {
        mdxOptions: (opts) => {
          opts.rehypePlugins = [...(opts.rehypePlugins ?? []), ...(rehypePlugins ?? [])]
          opts.remarkPlugins = [
            addRawDocumentToVFile(rawDocumentData),
            ...(opts.remarkPlugins ?? []),
            ...(remarkPlugins ?? []),
          ]
          return mapMdxOptions ? mapMdxOptions(opts) : opts
        },
        // User-provided cwd trumps resolution
        cwd: cwd_ ?? getCwd(),
        esbuildOptions: (opts, frontmatter) => {
          // NOTE this is needed to avoid `esbuild` from logging a warning regarding the `tsconfig.json` target option not being used
          opts.target = 'es2020'
          return mapEsbuildOptions ? mapEsbuildOptions(opts, frontmatter) : opts
        },
        // NOTE `restOptions` should be spread at the end to allow for user overrides
        ...restOptions,
      }

      const res = yield* $(T.tryPromise(() => mdxBundler.bundleMDX({ source: mdxString, ...mdxOptions })))

      if (res.errors.length > 0) {
        return yield* $(T.fail(res.errors))
      }

      return res.code
    }),
    T.mapError((error) => new UnexpectedMDXError({ error })),
    T.tapError(() => OT.addAttribute('mdxString', mdxString)),
    OT.withSpan('@contentlayer/core/markdown:bundleMDX'),
  )

export class UnexpectedMDXError extends Tagged('UnexpectedMDXError')<{ readonly error: unknown }> {
  toString = () => `UnexpectedMDXError: ${errorToString(this.error)}`
}
