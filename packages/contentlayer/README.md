# Contentlayer [![](https://badgen.net/npm/v/contentlayer)](https://www.npmjs.com/package/contentlayer) [![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.gg/fk83HNECYJ)

Contentlayer turns your content into data - making it super easy to `import` MD(X) and CMS content in your app

![](https://images2.imgbox.com/d5/db/LtP3GT3s_o.png)

> NOTE: Contentlayer is still in alpha and under active development. We expect to release a more stable beta version soon.

## Try out an example

There are multiple [example projects](./examples) which you can clone to try out locally or in via Gitpod or Stackblitz in your browser:

[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-908a85?logo=gitpod)](http://gitpod.io/#GH_OWNER=contentlayerdev,GH_REPO=contentlayer,GH_SUBDIR=examples\mdx,GH_COMMAND=yarn/https://github.com/schickling-test/gitpod-open) [![StackBlitz](https://img.shields.io/badge/StackBlitz-Edit-blue?style=flat-square&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAABECAYAAAD+1gcLAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5AINBw4X0bTGRQAABSxJREFUaN7VmVtsFFUYx//fmQW79bbd2QKpaIIaDcGoifFBEgMGqTTRRA01SgxE5Rbi7QG6S3lgo9J2twpeotxEQlCigLdoQwJ4ARN9QB9MRCNRDBdRzE7LJbTSmTl/H4BYStmd2Z3tDOdt5lzml/9833fO9x0gYi2xgom6Tt5aapyKEnRDlrVGPzfGT+G3SwZ87HLGT8f5uYD7jmSl99IAX80RfTY3A5wMqDVepoQPnqVKHtMbAN4PyJeFtPwafXBSknG9UoDHAIDQq7xODRU8mdc5Aeaeffy7O2F8GnnwZM5dKsCic88CrMU8sSMNbubdZwTIDnjlOoZa52eNYQc3c84sEK+d/1a6ji2UA5EFN3POw4C8fcYy/m+a3p1y2MGTOXsqIJsAxAZ1Hei53tgeSfBkBycK1McALrswJGIVHhE3cuD1ed4uorsAXD5Ed7/hqvXlrFtV8LpO3qKpdwJIDLn/AB/+s0SORgp8VJ43KK23AzAvNsagWlXu+lKV6LGc14itvyEwrsiwX6wWNQEijITiY9pYD1vvKAENAG+VC40hQlNlNt3Bq22lt4EYX2Jor6PVe5V8KzDFG7KsFXE/A3GHB/vcdHyx9IQPnuXI/ji3CuRuT+N1+U4ZHPhmGqk43yXY5C0ccE9hsfwQLjgp5n69hmCz9ylYGcRPrgg8ldfLIXjSx5RjNX3GB6GCm3m3ncDz/v4QNnjJ4KsGbubdVhAZ35YFtTaoKOY7jps5dwGIZf73aH7dnZa9QYH72vLNDmcmRNaX86eEnGvT2BoIdA0o3pV2HgRkS9C7bXnRDGlPypmd9r2AvB8FaAFetDJGvqTiyU7eJWeOp1cgfOo3rRbj6ZJRJdHB20TrrkhAAxutXvVsSedMtfEmGno3gNHhM8snVp80IytO0The18HraOgdkYCm7KyLy6MDoYdUfNQyjnZjeheAm8NXmt/FlDH16CI5dUHaN/DhypeZUqK/AkomAsMQ8fCjq41GKy0nim75ydd51UjX3QZgQgQccV/MUfcVSzYM4Mw1hnPa7QJkYgSgD2qqe6xWOVL8kLWaI3ptbgFkUgSgjwpUY09GDpY8ZJnH9UsExhPYH8CuVgtgTJlzC5pqipXxdpUSaF3FzLkdANJleOIJETWlkJbvh78glOVIM64PARjlc2afiGoqtMiuUMoTqRp3ehnQtpDNfqEDBdeC+T6nuELOLGRiXVVPJC5u2xwP6L0+1qOQ8wqZWNmpXECK6wV+RBCipRLoQBRvyLL2dFwfBlDnTWos7W4xXgi3IATg31p3hldoEG8EAR0IuEC8OuUGK62eCyoYVARutvNOL9VZQD6yxqmnKqmHB6u46PkejHp7XVxmlHOzVhXnTKxgwujXhzH0bdo56m9jymgcKhEITXFl61lFoYV7BMa0akCjkjqJEHOKdP/U7xhNJ1vlZLXOv2Upnmq3JxfJlH4XRzWebBWrmgf38hRXav5F4vSfjqGmHl8if1W/NuSzjWljvW3oQxh0Ly9AQRtqUvdC+Xk4UiXfpmLH9JzB0CBOQKtpwwXtHzxLJcTsQW97FdQDQVxIVc3GUzVuEyEDb4z7NTndysju4c6qfSlOOc8pXQof78nEtoVRDvDsnMlXeK04+o+ztRgSnNOdjq1DSM2z4uLoeecKSCQWhgntXfEsY2ZcHwDQAMESq8VoC7ty5EnxZK37EIAGAV6NArT3c3def2Hm3HdASlSYSipe384bAR6x+tTsIBOBqoMTzlirVz2BrOgoWcF/mizikfkwKiQAAAAASUVORK5CYII=)](https://stackblitz.com/edit/github-38v7yj-m5ynvg?devtoolsheight=33&embed=1&file=posts/post-01.md)

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
- [jahir.dev](https://jahir.dev/) ([Source](https://github.com/jahirfiquitiva/jahir.dev))
- [samuelkraft.com](https://samuelkraft.com) ([Source](https://github.com/samuelkraft/samuelkraft-next))
- [nirmalyaghosh.com](https://nirmalyaghosh.com) ([Source](https://github.com/ghoshnirmalya/nirmalyaghosh.com))
- [miryang.dev](https://miryang.dev) ([Source](https://github.com/MiryangJung/miryang.dev))
- [osiux.ws](https://www.osiux.ws) ([Source](https://github.com/osiux/osiux.ws))
- [akhilaariyachandra.com](https://akhilaariyachandra.com/) ([Source](https://github.com/akhila-ariyachandra/akhilaariyachandra.com))
- [dawchihliou.github.io](https://dawchihliou.github.io) ([Source](https://github.com/DawChihLiou/dawchihliou.github.io))
- [sergiobarria.com](https://sergiobarria.com/) ([Source](https://github.com/sergiobarria/sergiobarria.com))
- [adeecc.vercel.app](https://adeecc.vercel.app/) ([Source](https://github.com/adeecc/blogfolio))

Are you using Contentlayer? Please add yourself to the list above via a PR. 🙏
