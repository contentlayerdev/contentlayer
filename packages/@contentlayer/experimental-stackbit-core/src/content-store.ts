import type { ContentStoreTypes } from '@stackbit/cms-core'
import { ContentStore, getCommandRunner, GitService } from '@stackbit/cms-core'
import type * as StackbitTypes from '@stackbit/types'
import { Worker } from '@stackbit/utils'

import { createNoopLogger } from './utils.js'

export { type ContentStoreTypes } from '@stackbit/cms-core'

export const createContentStore = (
  options: {
    logger?: StackbitTypes.Logger
    userLogger?: StackbitTypes.Logger
    onSchemaChangeCallback?: () => void
    onContentChangeCallback?: (contentChanges: ContentStoreTypes.ContentChangeResult) => void
  } = {},
) => {
  const runCommand = getCommandRunner({ env: {} })
  const logger = options.logger ?? createNoopLogger()
  const userLogger = options.userLogger ?? createNoopLogger()
  return new ContentStore({
    logger: logger,
    userLogger: userLogger,
    localDev: false,
    runCommand,
    git: new GitService({
      repoUrl: '',
      repoDir: '',
      repoBranch: 'preview',
      repoPublishBranch: 'master',
      worker: new Worker(),
      runCommand,
      logger: logger,
      userLogger: userLogger,
    }),
    staticAssetsPublicPath: '/_static/app-assets',
    onSchemaChangeCallback: options.onSchemaChangeCallback ?? (() => {}),
    onContentChangeCallback:
      options.onContentChangeCallback ?? ((_contentChanges: ContentStoreTypes.ContentChangeResult) => {}),
    handleConfigAssets: async (data) => ({
      models: data.models ?? [],
      presets: data.presets ?? {},
    }),
  })
}
