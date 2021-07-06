import { traceAsyncFn } from '@contentlayer/utils'
import { bundleMDX as bundleMDX_ } from 'mdx-bundler'

import type { MarkdownOptions } from './plugin'

export const bundleMDX = (async ({
  mdxString,
  options,
}: {
  mdxString: string
  options?: MarkdownOptions
}): Promise<string> => {
  // TODO should be fixed in `mdx-bundler`
  if (mdxString.length === 0) {
    return ''
  }

  const res = await bundleMDX_(mdxString, {
    xdmOptions: (opts) => {
      opts.rehypePlugins = [...(opts.rehypePlugins ?? []), ...(options?.rehypePlugins ?? [])]
      opts.remarkPlugins = [...(opts.remarkPlugins ?? []), ...(options?.remarkPlugins ?? [])]
      return opts
    },
  })
  return res.code
})['|>'](traceAsyncFn('@contentlayer/core/mdx:bundleMDX', ['options']))
