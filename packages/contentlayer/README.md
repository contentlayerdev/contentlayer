# Contentlayer [![](https://badgen.net/npm/v/contentlayer)](https://www.npmjs.com/package/contentlayer) [![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.gg/fk83HNECYJ)

Contentlayer turns your content into data - making it super easy to `import` MD(X) and CMS content in your app

![](https://images2.imgbox.com/d5/db/LtP3GT3s_o.png)

> NOTE: Contentlayer is still in alpha and under active development. We expect to release a more stable beta version soon.

## Try out an example

There are multiple [example projects](./examples) which you can clone to try out locally or in via Gitpod in your browser:

[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-908a85?logo=gitpod)](http://gitpod.io/#GH_OWNER=contentlayerdev,GH_REPO=contentlayer,GH_SUBDIR=examples\mdx,GH_COMMAND=yarn/https://github.com/schickling-test/gitpod-open)

## Features

- Supported content sources:
  - [x] Local content (Markdown, MDX, JSON, YAML)
  - [x] Contentful
  - [x] Sanity (experimental)
- Live-reload on content changes
- Fast and incremental builds (many times faster than Gatsby in most cases)
- Simple but powerful schema DSL to design your content model (validates your content and generates types)
- Auto-generated TypeScript types based on your content model (e.g. frontmatter or CMS schema)

### Roadmap

- [ ] Better getting started experience with auto-scaffolding of config file based on existing content files
- [ ] Stackbit integration
- [ ] Incremental data fetching for Contentful
- [ ] More content sources:
  - [ ] Notion
  - [ ] GraphCMS
  - [ ] ...

## Documentation

You can find the [full documention for Contentlayer here](https://www.contentlayer.dev/docs).

## Usage with Next.js

### Install dependencies

```sh
npm install contentlayer next-contentlayer
```

### Create `contentlayer.config.ts` file

```ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import highlight from 'rehype-highlight'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `**/*.md`,
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date' },
  },
}))

export default makeSource({
  contentDirPath: 'posts',
  documentTypes: [Post],
  markdown: { rehypePlugins: [highlight] },
})
```

### Set up Next.js plugin in `next.config.js` (optional: enables live-reload and build setup)

```js
const { withContentlayer } = require('next-contentlayer')

module.exports = withContentlayer()({
  // Your Next.js config...
})
```

## Who is using Contentlayer?

- [ped.ro](https://ped.ro) ([Source](https://github.com/peduarte/ped.ro))
- [GraphCMS Docs](https://graphcms.com/docs)
- [leerob.io](https://leerob.io/) ([Source](https://github.com/leerob/leerob.io))
- [axeldelafosse.com](https://axeldelafosse.com) ([Source](https://github.com/axeldelafosse/axeldelafosse))
- [arthurvdiniz.me](https://arthurvdiniz.me) ([Source](https://github.com/arthurvdiniz/me))
- [imadatyatalah.vercel.app](https://imadatyatalah.vercel.app) ([Source](https://github.com/imadatyatalah/imadatyatalah.me))

Are you using Contentlayer? Please add yourself to the list above via a PR. 🙏
