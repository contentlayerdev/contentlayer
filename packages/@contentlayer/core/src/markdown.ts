import { errorToString } from '@contentlayer/utils'
import { OT, pipe, T, Tagged } from '@contentlayer/utils/effect'
import html from 'rehype-stringify'
import markdown from 'remark-parse'
import remark2rehype from 'remark-rehype'
import { unified } from 'unified'

import type { MarkdownOptions } from './plugin.js'

export const markdownToHtml = ({
  mdString,
  options,
}: {
  mdString: string
  options?: MarkdownOptions
}): T.Effect<OT.HasTracer, UnexpectedMarkdownError, string> =>
  pipe(
    T.gen(function* ($) {
      // const matterResult = matter(mdString)

      // Use remark to convert markdown into HTML string
      // const processedContent = await remark().use(html).process(matterResult.content)

      if (process.env['CL_FAST_MARKDOWN']) {
        // NOTE `markdown-wasm` is an optional peer dependency
        return yield* $(
          T.tryPromise(async () => {
            const { parse: parseWasm } = await import('markdown-wasm/dist/markdown.node.js')
            return parseWasm(mdString)
          }),
        )
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

      const res = yield* $(T.tryPromise(() => builder.process(mdString)))

      return res.toString()
    }),
    T.catchAllDefect(T.fail),
    T.mapError((error) => new UnexpectedMarkdownError({ error })),
    OT.withSpan('@contentlayer/core/markdown:markdownToHtml'),
  )

export class UnexpectedMarkdownError extends Tagged('UnexpectedMarkdownError')<{ readonly error: unknown }> {
  toString = () => `UnexpectedMarkdownError: ${errorToString(this.error)}`
}
