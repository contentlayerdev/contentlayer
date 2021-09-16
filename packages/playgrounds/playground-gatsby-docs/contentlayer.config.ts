import rehypeShiki from '@leafac/rehype-shiki'
import type { FieldDef } from 'contentlayer/source-files'
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import * as path from 'path'
import * as shiki from 'shiki'

const fields: Record<string, FieldDef> = {
  title: {
    type: 'string',
    required: true,
  },
}

const Reference = defineDocumentType(() => ({
  name: 'Reference',
  filePathPattern: 'docs/reference/**/*.md',
  fields,
}))

const HowTo = defineDocumentType(() => ({
  name: 'HowTo',
  filePathPattern: 'docs/how-to/**/*.md',
  fields,
}))

const Conceptual = defineDocumentType(() => ({
  name: 'Conceptual',
  filePathPattern: 'docs/conceptual/**/*.md',
  fields,
}))

const Tutorial = defineDocumentType(() => ({
  name: 'Tutorial',
  filePathPattern: 'tutorial/**/*.md',
  fields,
}))

export default makeSource(async () => {
  const shikiPath = (dir: string) => path.join(require.resolve('shiki'), '..', '..', dir, path.sep)
  const highlighter = await shiki.getHighlighter({
    paths: { languages: shikiPath('languages'), themes: shikiPath('themes') },
    theme: 'github-light',
  })

  return {
    contentDirPath: path.join(process.cwd(), 'gatsby', 'docs'),
    documentTypes: [Reference, HowTo, Conceptual, Tutorial],
    onUnknownDocuments: 'skip-ignore',
    markdown: {
      rehypePlugins: [[rehypeShiki, { highlighter }]],
    },
  }
})
