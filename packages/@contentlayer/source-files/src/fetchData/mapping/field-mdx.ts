import * as core from '@contentlayer/core'
import type { AbsolutePosixFilePath } from '@contentlayer/utils'
import * as utils from '@contentlayer/utils'
import type { OT } from '@contentlayer/utils/effect'
import { T } from '@contentlayer/utils/effect'

import type { HasDocumentContext } from '../DocumentContext.js'
import { getFromDocumentContext } from '../DocumentContext.js'

export const makeMdxField = ({
  mdxString,
  options,
  contentDirPath,
  isDocumentBodyField,
}: {
  mdxString: string
  options: core.PluginOptions
  contentDirPath: AbsolutePosixFilePath
  isDocumentBodyField: boolean
}): T.Effect<HasDocumentContext & OT.HasTracer, core.UnexpectedMDXError, core.MDX> =>
  T.gen(function* ($) {
    const rawDocumentData = yield* $(getFromDocumentContext('rawDocumentData'))
    // NOTE for the body field, we're passing the entire document file contents to MDX (e.g. in case some remark/rehype plugins need access to the frontmatter)
    // TODO we should come up with a better way to do this
    if (isDocumentBodyField) {
      const rawContent = yield* $(getFromDocumentContext('rawContent'))
      if (rawContent.kind !== 'mdx' && rawContent.kind !== 'markdown') return utils.assertNever(rawContent)

      const code = yield* $(
        core.bundleMDX({
          mdxString: rawContent.rawDocumentContent,
          options: options?.mdx,
          contentDirPath,
          rawDocumentData,
        }),
      )
      return { raw: mdxString, code }
    } else {
      const code = yield* $(core.bundleMDX({ mdxString, options: options?.mdx, contentDirPath, rawDocumentData }))
      return { raw: mdxString, code }
    }
  })
