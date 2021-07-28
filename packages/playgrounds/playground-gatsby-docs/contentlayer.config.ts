import rehypeShiki from '@leafac/rehype-shiki'
import { fromLocalContent } from 'contentlayer/source-local'
import type { FieldDef } from 'contentlayer/source-local/schema'
import { defineDocument } from 'contentlayer/source-local/schema'
import * as path from 'path'
import * as shiki from 'shiki'

const fields: Record<string, FieldDef> = {
  title: {
    type: 'string',
    required: true,
  },
}

const Reference = defineDocument(() => ({
  name: 'Reference',
  filePathPattern: 'docs/reference/**/*.md',
  fields,
}))

const HowTo = defineDocument(() => ({
  name: 'HowTo',
  filePathPattern: 'docs/how-to/**/*.md',
  fields,
}))

const Conceptual = defineDocument(() => ({
  name: 'Conceptual',
  filePathPattern: 'docs/conceptual/**/*.md',
  fields,
}))

const Tutorial = defineDocument(() => ({
  name: 'Tutorial',
  filePathPattern: 'tutorial/**/*.md',
  fields,
}))

export default fromLocalContent(async () => {
  const shikiPath = (dir: string) => path.join(require.resolve('shiki'), '..', '..', dir, path.sep)
  const highlighter = await shiki.getHighlighter({
    paths: { languages: shikiPath('languages'), themes: shikiPath('themes') },
    theme: 'github-light',
  })

  return {
    contentDirPath: path.join(process.cwd(), 'gatsby', 'docs'),
    schema: [Reference, HowTo, Conceptual, Tutorial],
    onExtraData: 'ignore',
    onMissingOrIncompatibleData: 'skip',
    markdown: {
      rehypePlugins: [[rehypeShiki, { highlighter }]],
    },
  }
})
