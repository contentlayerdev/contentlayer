# Contentlayer

Contentlayer transforms content (e.g. Markdown or CMS content) into data you can easily `import` in your application.

> NOTE: Contentlayer is still under heavy development and shouldn't be used in production yet.

## Features

- Supported content sources:
  - [x] Local content (Markdown, MDX, JSON, YAML)
  - [x] Contentful
  - [x] Sanity
- Simple but powerful schema DSL to design your content model
- Auto-generated TypeScript types based on your content model (e.g. frontmatter)

### Roadmap

- More content sources:
  - [ ] Notion
  - [ ] GraphCMS
- [ ] Incremental data fetching

## Usage with Next.js

### Install dependencies

- Create `contentlayer.config.ts` file. Example

```ts
import { defineDocument, fromLocalContent } from 'contentlayer/source-files'
import highlight from 'rehype-highlight'

export const Post = defineDocument(() => ({
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

export default fromLocalContent({
  contentDirPath: 'posts',
  schema: [Post],
  markdown: { rehypePlugins: [highlight] },
})
```

## Usage via CLI

## Developing Contentlayer

```
git clone --recurse-submodules git://github.com/schickling/contentlayer.git
yarn install
yarn build
```
