import rehypeShiki from '@stefanprobst/rehype-shiki'
import type { FieldDef} from 'contentlayer/source-files';
import { defineDocumentType, defineNestedType,makeSource } from 'contentlayer/source-files'
import { createRequire } from 'module'
import * as path from 'path'
import * as shiki from 'shiki'

const Example = defineNestedType(() => ({
  name: 'Example',
  fields: {
    label: { type: 'string' },
    href: { type: 'string' },
  },
}))

const fields: Record<string, FieldDef> = {
  title: {
    type: 'string',
    required: true,
  },
  jsdoc: {
    type: 'list',
    of: {type: 'string'},
  },
  tableOfContentsDepth: { type: 'number' },
  showTopLevelSignatures: { type: 'boolean' },
  date: { type: 'string' },
  version: { type: 'string' },
  canonicalLink: { type: 'string' },
  apiCalls: { type: 'string' },
  contentsHeading: { type: 'string' },
  description: { type: 'string' },
  examples: {
    type: 'list',
    of: Example,
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
  const require = createRequire(import.meta.url)
  const shikiPkgPath = (dir: string) => path.join(require.resolve('shiki'), '..', '..', dir, path.sep)
  const highlighter = await shiki.getHighlighter({
    paths: { languages: shikiPkgPath('languages'), themes: shikiPkgPath('themes') },
    theme: 'github-light',
  })

  return {
    contentDirPath: 'content',
    documentTypes: [Reference, HowTo, Conceptual, Tutorial],
    // onUnknownDocuments: 'skip-ignore',
    markdown: {
            // '@stefanprobst/rehype-shiki', {}
      rehypePlugins: [[rehypeShiki, { highlighter }]],
    },
  }
})
