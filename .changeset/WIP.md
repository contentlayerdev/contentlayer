0.1.0

- [ ] Fix Node.js live reload bug
- [ ] Renamed `default` to `fallback`
- [ ] Moved `defineDocumentType` and `defineNestedType` from `contentlayer/source-files` to `contentlayer/schema`
  - [ ] ? In conflict with: Rename `fields` to `frontmatter`
- [ ] Unified concept of `fieldOptions.typeFieldName` and `filePathPattern` to `resolveDocumentType`
  - also moves the concept of `bodyType` to `makeSource`
  - how to integrate with remark processors etc?
- Change computed field concept
- [x] Generate files to `contentlayer/generated` that links to `node_modules/.contentlayer`
- [x] Contentlayer now passes the full MDX/MD file content (incl. frontmatter) to remark/rehype
- [x] Generate types as part of NPM `postinstall` (closes #114)
- [x] Improve type generation (closes #69)
- [ ] ? MDX v2 and remove mdx-bundler
- [ ] Validate there are no nested types with the same name

## New `.contentlayer` generation

- Benefits

  - Live reload of schema changes now work without having to restart TS server in VSC
    - TODO check this also works when cloning an existing repo without generated .contentlayer files -> opening a file that imports from generated -> should fail and auto-recover when `contentlayer dev` starts
  - Auto-import works
  - No symlinks needed anymore
  - Less to learn for new users

- Migration steps

  - Delete `node_modules/.contentlayer` folder and `.contentlayer` symlink
  - Requires the following in your `tsconfig.json` / `jsconfig.json`

    ```json
    {
      "compilerOptions": {
        "baseUrl": ".",
        "paths": {
          "contentlayer/generated": ["./.contentlayer/generated"]
        }
      },
      "include": ["next-env.d.ts", "**/*.tsx", "**/*.ts", ".contentlayer/generated"]
      //                                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^
    }
    ```

  - Rename import statements from `.contentlayer/data` / `.contentlayer/types` to `contentlayer/generated`

- Fixes
  - Fixes https://github.com/contentlayerdev/contentlayer/issues/113
- TODO: the next-integration package should check whether the neccessary tsconfig options are provided
