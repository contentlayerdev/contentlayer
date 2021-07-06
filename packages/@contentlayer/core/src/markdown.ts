import { traceAsyncFn } from '@contentlayer/utils'
import type { parse as parseWasmType } from 'markdown-wasm'
import html from 'rehype-stringify'
import markdown from 'remark-parse'
import remark2rehype from 'remark-rehype'
const parseWasm: typeof parseWasmType = require('markdown-wasm/dist/markdown.node.js').parse
import unified from 'unified'

import type { MarkdownOptions } from './plugin'

export const markdownToHtml = (async ({
  mdString,
  options,
}: {
  mdString: string
  options?: MarkdownOptions
}): Promise<string> => {
  // const matterResult = matter(mdString)

  // Use remark to convert markdown into HTML string
  // const processedContent = await remark().use(html).process(matterResult.content)

  if (process.env['CL_FAST_MARKDOWN']) {
    return parseWasm(mdString)
  }

  const builder = unified().use(markdown)

  if (options?.remarkPlugins) {
    builder.use(options.remarkPlugins)
  }

  builder.use(remark2rehype)

  if (options?.rehypePlugins) {
    builder.use(options.rehypePlugins)
  }

  builder.use(html)

  const res = await builder.process(mdString)

  return res.toString()
})['|>'](traceAsyncFn('@contentlayer/core/markdown:markdownToHtml', ['options']))
