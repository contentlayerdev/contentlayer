import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import { bundleMDX } from 'mdx-bundler'
import * as ReactDOMServer from 'react-dom/server'
import { getMDXComponent } from 'mdx-bundler/client/index.js'

const mdxToHtml = async (mdxSource: string) => {
  const { code } = await bundleMDX({ source: mdxSource })
  const MDXLayout = getMDXComponent(code)
  // TODO add your own components here
  const element = MDXLayout({ components: {} })!
  const html = ReactDOMServer.renderToString(element)
  return html
}

const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      description: 'The title of the post',
      required: true,
    },
    date: {
      type: 'date',
      description: 'The date of the post',
      required: true,
    },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `/posts/${doc._raw.flattenedPath}`,
    },
    mdxHtml: {
      type: 'string',
      resolve: async (doc) => mdxToHtml(doc.body.raw),
    },
  },
}))

export default makeSource({
  contentDirPath: 'posts',
  documentTypes: [Post],
  disableImportAliasWarning: true,
})
