import type * as core from '@contentlayer/core'
import * as StackbitCore from '@contentlayer/experimental-stackbit-core'
import type * as SourceFiles from '@contentlayer/source-files'
import { T } from '@contentlayer/utils/effect'

export {
  type ContentlayerOverrideArgs,
  type ContentlayerOverrideDocumentType,
  type ContentlayerOverrideNestedType,
  StackbitError,
  stackbitConfigToDocumentTypes,
} from '@contentlayer/experimental-stackbit-core'

/**
 * @example
 * ```ts
 * // contentlayer.config.ts
 * import { makeSource } from 'contentlayer/source-files'
 * import { loadStackbitConfigAsDocumentTypes } from '@contentlayer/experimental-source-files-stackbit'
 *
 * // Looks for `stackbit.yaml` in the current directory
 * export default loadStackbitConfigAsDocumentTypes().then((documentTypes) => {
 *   return makeSource({ contentDirPath: 'content', documentTypes })
 * })
 * ```
 */
export const loadStackbitConfigAsDocumentTypes = <TDocumentTypeNames extends core.GetDocumentTypeNamesGen>(
  options: { dirPath: string; fetchSchema: boolean } = { dirPath: '', fetchSchema: false },
  overrideArgs: StackbitCore.ContentlayerOverrideArgs<TDocumentTypeNames> = { documentTypes: {}, nestedTypes: {} },
): Promise<SourceFiles.DocumentType[]> =>
  T.runPromise(StackbitCore.loadStackbitConfigAsDocumentTypes(options, overrideArgs))
