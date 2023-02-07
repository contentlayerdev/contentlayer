---
'contentlayer': patch
---

Fix type resolution when using modern TypeScript module resolution

Ensure types exported from `contentlayer/core`, `contentlayer/source-files`,
and `contentlayer/client` that are imported into generated code resolve
properly when TypeScript is configured with `moduleResolution` set to
`nodenext` or `node16`.
