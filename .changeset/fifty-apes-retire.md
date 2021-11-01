---
'next-contentlayer': patch
---

Addressing #5 `next-contentlayer` now ships with full MDX support out of the box (using `mdx-bundler` under the hood). This means you no longer need `mdx-bundler` as part of your `package.json` dependencies. Here is a simple example:

```ts
import { useMDXComponent } from 'next-contentlayer/hooks'

const DocPage: React.FC = ({ doc }) => {
  const MDXContent = useMDXComponent(doc.body.code)
```
