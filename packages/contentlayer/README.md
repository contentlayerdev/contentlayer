# Contentlayer

Contentlayer turns your content into data - making it super easy to `import` MD(X) and CMS content in your app

![](https://images2.imgbox.com/d5/db/LtP3GT3s_o.png)

> NOTE: Contentlayer is still under development.

## Features

- Supported content sources:
  - [x] Local content (Markdown, MDX, JSON, YAML)
  - [x] Contentful
  - [x] Sanity
- Live-reload on content changes
- Fast and incremental builds (many times faster than Gatsby in most cases)
- Simple but powerful schema DSL to design your content model (validates your content and generates types)
- Auto-generated TypeScript types based on your content model (e.g. frontmatter)

### Roadmap

- Better getting started experience with auto-scaffolding of config file based on existing content files
- More content sources:
  - [ ] Notion
  - [ ] GraphCMS
- Stackbit integration
- [ ] Incremental data fetching for Contentful

## Usage with Next.js

### Install dependencies

- Create `contentlayer.config.ts` file. Example

```ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import highlight from 'rehype-highlight'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `**/*.md`,
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
    slug: { type: 'string', resolve: (_) => _._id.replace('.md', '') },
  },
}))

export default makeSource({
  contentDirPath: 'posts',
  documentTypes: [Post],
  markdown: { rehypePlugins: [highlight] },
})
```

## Who is using Contentlayer?

- [ped.ro](https://ped.ro) ([Source](https://github.com/peduarte/ped.ro))
- [GraphCMS Docs](https://graphcms.com/docs)

Are you using Contentlayer? Please add yourself to the list above via a PR. 🙏

