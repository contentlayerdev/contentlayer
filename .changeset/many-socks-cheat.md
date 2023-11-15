---
'@contentlayer/cli': patch
---

Fix exit code error in build command on **Node 20+**:

```sh
Generated 100 documents in .contentlayer
TypeError: The "code" argument must be of type number. Received an instance of Object
    at process.set [as exitCode] (node:internal/bootstrap/node:123:9)
    at Cli.runExit (./node_modules/@contentlayer/cli/node_modules/clipanion/lib/advanced/Cli.js:232:26)
    at run (file:///./node_modules/@contentlayer/cli/src/index.ts:39:3)
    at main (./node_modules/contentlayer/bin/cli.cjs:5:3) {
  code: 'ERR_INVALID_ARG_TYPE'
}
```
