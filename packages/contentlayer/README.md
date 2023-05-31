# <img src="https://i.imgur.com/fdY8IX2.png" height="30" />&nbsp;&nbsp;Contentlayer [![](https://badgen.net/npm/v/contentlayer)](https://www.npmjs.com/package/contentlayer) [![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.gg/fk83HNECYJ)

Contentlayer is a content SDK that validates and transforms your content into type-safe JSON data you can easily `import` into your application's pages.

[![Video Thumbnail](https://i.imgur.com/y3p4hDN.png)](https://www.youtube.com/watch?v=58Pj4a4Us7A)

**⚠️ Contentlayer is currently in beta. There might still be breaking changes before the upcoming 1.0 release.**

## Getting Started

The video above is a brief look at Contentlayer. Explore further with our [example projects](https://www.contentlayer.dev/examples), which you can clone to try out locally or in via Gitpod or Stackblitz in your browser.

[![StackBlitz](https://img.shields.io/badge/StackBlitz-Edit-blue?style=flat-square&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAABECAYAAAD+1gcLAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5AINBw4X0bTGRQAABSxJREFUaN7VmVtsFFUYx//fmQW79bbd2QKpaIIaDcGoifFBEgMGqTTRRA01SgxE5Rbi7QG6S3lgo9J2twpeotxEQlCigLdoQwJ4ARN9QB9MRCNRDBdRzE7LJbTSmTl/H4BYStmd2Z3tDOdt5lzml/9833fO9x0gYi2xgom6Tt5aapyKEnRDlrVGPzfGT+G3SwZ87HLGT8f5uYD7jmSl99IAX80RfTY3A5wMqDVepoQPnqVKHtMbAN4PyJeFtPwafXBSknG9UoDHAIDQq7xODRU8mdc5Aeaeffy7O2F8GnnwZM5dKsCic88CrMU8sSMNbubdZwTIDnjlOoZa52eNYQc3c84sEK+d/1a6ji2UA5EFN3POw4C8fcYy/m+a3p1y2MGTOXsqIJsAxAZ1Hei53tgeSfBkBycK1McALrswJGIVHhE3cuD1ed4uorsAXD5Ed7/hqvXlrFtV8LpO3qKpdwJIDLn/AB/+s0SORgp8VJ43KK23AzAvNsagWlXu+lKV6LGc14itvyEwrsiwX6wWNQEijITiY9pYD1vvKAENAG+VC40hQlNlNt3Bq22lt4EYX2Jor6PVe5V8KzDFG7KsFXE/A3GHB/vcdHyx9IQPnuXI/ji3CuRuT+N1+U4ZHPhmGqk43yXY5C0ccE9hsfwQLjgp5n69hmCz9ylYGcRPrgg8ldfLIXjSx5RjNX3GB6GCm3m3ncDz/v4QNnjJ4KsGbubdVhAZ35YFtTaoKOY7jps5dwGIZf73aH7dnZa9QYH72vLNDmcmRNaX86eEnGvT2BoIdA0o3pV2HgRkS9C7bXnRDGlPypmd9r2AvB8FaAFetDJGvqTiyU7eJWeOp1cgfOo3rRbj6ZJRJdHB20TrrkhAAxutXvVsSedMtfEmGno3gNHhM8snVp80IytO0The18HraOgdkYCm7KyLy6MDoYdUfNQyjnZjeheAm8NXmt/FlDH16CI5dUHaN/DhypeZUqK/AkomAsMQ8fCjq41GKy0nim75ydd51UjX3QZgQgQccV/MUfcVSzYM4Mw1hnPa7QJkYgSgD2qqe6xWOVL8kLWaI3ptbgFkUgSgjwpUY09GDpY8ZJnH9UsExhPYH8CuVgtgTJlzC5pqipXxdpUSaF3FzLkdANJleOIJETWlkJbvh78glOVIM64PARjlc2afiGoqtMiuUMoTqRp3ehnQtpDNfqEDBdeC+T6nuELOLGRiXVVPJC5u2xwP6L0+1qOQ8wqZWNmpXECK6wV+RBCipRLoQBRvyLL2dFwfBlDnTWos7W4xXgi3IATg31p3hldoEG8EAR0IuEC8OuUGK62eCyoYVARutvNOL9VZQD6yxqmnKqmHB6u46PkejHp7XVxmlHOzVhXnTKxgwujXhzH0bdo56m9jymgcKhEITXFl61lFoYV7BMa0akCjkjqJEHOKdP/U7xhNJ1vlZLXOv2Upnmq3JxfJlH4XRzWebBWrmgf38hRXav5F4vSfjqGmHl8if1W/NuSzjWljvW3oQxh0Ly9AQRtqUvdC+Xk4UiXfpmLH9JzB0CBOQKtpwwXtHzxLJcTsQW97FdQDQVxIVc3GUzVuEyEDb4z7NTndysju4c6qfSlOOc8pXQof78nEtoVRDvDsnMlXeK04+o+ztRgSnNOdjq1DSM2z4uLoeecKSCQWhgntXfEsY2ZcHwDQAMESq8VoC7ty5EnxZK37EIAGAV6NArT3c3def2Hm3HdASlSYSipe384bAR6x+tTsIBOBqoMTzlirVz2BrOgoWcF/mizikfkwKiQAAAAASUVORK5CYII=)](https://stackblitz.com/edit/github-38v7yj-m5ynvg?devtoolsheight=33&embed=1&file=posts/post-01.md)

[![Contentlayer Playground](https://i.imgur.com/ux4iolO.png)](https://stackblitz.com/edit/github-38v7yj-m5ynvg?devtoolsheight=33&embed=1&file=posts/post-01.md)

### Tutorial & Documentation

Follow [the tutorial](https://www.contentlayer.dev/docs/getting-started) to get started building your own project. Or explore [the full documentation](https://www.contentlayer.dev/docs).

## Features

- Live reload on content changes
- Fast and incremental builds
- Simple but powerful schema DSL to design your content model (validates your content and generates types)
- Auto-generated TypeScript types based on your content model (e.g. frontmatter or CMS schema)

### Supported Content Sources

- Local content (Markdown, MDX, JSON, YAML)
- Contentful ([experimental](https://github.com/contentlayerdev/contentlayer/issues/173))
- Sanity ([considering](https://github.com/contentlayerdev/contentlayer/issues/172))
- Notion ([considering](https://github.com/contentlayerdev/contentlayer/issues/174))

### Supported Environments

- Next.js
- Remix ([considering](https://github.com/contentlayerdev/contentlayer/issues/169))
- SvelteKit ([considering](https://github.com/contentlayerdev/contentlayer/issues/170))
- Astro ([considering](https://github.com/contentlayerdev/contentlayer/issues/171))

### Roadmap

See [our docs](https://www.contentlayer.dev/docs/other/roadmap) for more information on our roadmap.

## Community

Join [our Discord community](https://discord.gg/fk83HNECYJ) to get help, suggest new features, and stay up to date on all things Contentlayer.

### Who is using Contentlayer?

- [ped.ro](https://ped.ro)
- [GraphCMS Docs](https://graphcms.com/docs)
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
- [alpesdream.vercel.app](https://alpesdream.vercel.app/) ([Source](https://github.com/patrick-xin/alpesdream))
- [bayukurnia.com](https://bayukurnia.com) ([Source](https://github.com/bwyx/bayukurnia.com))
- [makersleague.de](https://makersleague.de) ([Source](https://github.com/timoclsn/makersleague.de))
- [euisblue.me](https://www.euisblue.me/) ([Source](https://github.com/euisblue/bluelog))
- [thismodernweb.com](https://thismodernweb.com) ([Source](https://github.com/pmarsceill/this-modern-web))
- [scriptbar-snippets.tryapp.us](https://scriptbar-snippets.tryapp.us) ([Source](https://github.com/datduyng/scriptbar-snippets))
- [nikosantis.dev](https://nikosantis.dev) ([Source](https://github.com/nikosantis/nikosantis.dev))
- [phong.vn](https://phong.vn) ([Source](https://github.com/0xPhong/phong.vn))
- [dvl.sh](https://dvl.sh)
- [nicholaswarren.com](https://nicholaswarren.com)
- [blog.sandromaglione.com](https://blog.sandromaglione.com/)
- [achintyajha.com](https://achintyajha.com) ([Source](https://github.com/achintyajha/www))
- [datahub.io](https://datahub.io/blog)
- [Making Sense of Crypto and Web3](https://web3.lifeitself.us/)
- [cretu.dev](https://cretu.dev) ([Source](https://github.com/cristicretu/cretu.dev))
- [jarocki.me](https://jarocki.me) ([Source](https://github.com/BartoszJarocki/web-jarocki-me))
- [iyansr.id](https://iyansr.id) ([Source](https://github.com/iyansr/iyansr.id-reborn))
- [thisyujeong.dev](https://thisyujeong.dev) ([Source](https://github.com/thisyujeong/thisyujeong-dev))
- [gipsterya.com](https://gipsterya.com)
- [seankerwin.dev](https://seankerwin.dev) ([Source](https://github.com/lordkerwin/v2))
- [royanger.dev](https://royanger.dev) ([Source](https://github.com/royanger/royanger.com))
- [akashrajpurohit.com](https://akashrajpurohit.com/)
- [kyoung-jnn.com](https://kyoung-jnn.com) ([Source](https://github.com/kyoung-jnn/kyoung-jin-blog))
- [MrcatDev](https://blog-nextjs-olive.vercel.app/) ([Source](https://github.com/atxiii/blog-nextjs))
- [screfy.com](https://screfy.com) ([Source](https://github.com/screfy/screfy.com))
- [igorkowalczyk.dev](https://igorkowalczyk.dev) ([Source](https://github.com/igorkowalczyk/igorkowalczyk.github.io))
- [christianpenrod.com](https://christianpenrod.com) ([Source](https://github.com/penrodlol/christianpenrod))
- [xahidex.com](https://xahidex.com)
- [hellonext.co](https://hellonext.co)
- [heykapil.in](https://heykapil.in) ([Source](https://github.com/heykapil/new-blog/))
- [adrianmato.art](https://adrianmato.art)
- [livropog.com.br](https://livropog.com.br) ([Source](https://github.com/josenaldo/livro-pog))
- [rofireza.com](https://rofireza.com/) ([Source](https://github.com/arrofirezasatria/rofireza.com))
- [jakubh.com](https://jakubh.com/) ([Source](https://github.com/ivenuss/jakubh.com))
- [fiqry.dev](https://fiqry.dev/) ([Source](https://github.com/fiqryq/fiqry.dev))
- [soapbox.pub](https://soapbox.pub/) ([Source](https://gitlab.com/soapbox-pub/soapbox.pub))
- [hafidzamr.dev](https://hafidzamr.dev/) ([Source](https://github.com/hafidzamr/hafidzamr.dev))
- [anudeepreddy.dev](https://anudeepreddy.dev/)
- [nikhilmohite.com](https://nikhilmohite.com/)
- [shenlu.me](https://shenlu.me) ([Source](https://github.com/shenlu89/shenlu89.github.io))
- [chillinmice.dev](https://chillinmice-dev.vercel.app/) ([Source](https://github.com/restareaByWeezy/tech_blog))
- [wibb.me](https://wibb.me/) ([Source](https://github.com/wibb36/wibb.me))
- [jasongerbes.com](https://jasongerbes.com) ([Source](https://github.com/jasongerbes/jasongerbes.com))
- [Irregular-expressions.com](https://irregular-expressions.com) ([Source](https://github.com/samjhecht/irregular-expressions))
- [goosebumps.fm](https://goosebumps.fm) ([Source](https://github.com/txndai/nextgoose))
- [willin.wang](https://willin.wang) ([Source](https://github.com/willin/blog))
- [mateusf.vercel.app](https://mateusf.vercel.app) ([Source](https://github.com/mateusfg7/mfg-b))

Are you using Contentlayer? Please add your page (and repo) to the end of the list via a PR. 🙏
