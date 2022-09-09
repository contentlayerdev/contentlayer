import type { GetDocumentTypeNamesGen } from '@contentlayer/core'
import type * as SourceFiles from '@contentlayer/source-files'
import { defineDocumentType } from '@contentlayer/source-files'
import { not, partition } from '@contentlayer/utils'
import * as Stackbit from '@stackbit/sdk'
import { validateAndNormalizeConfig } from '@stackbit/sdk/dist/config/config-loader.js'

import type { SharedCtx } from './mapping.js'
import { stackbitDocumentLikeModelToDocumentType, stackbitObjectModelToDocumentType } from './mapping.js'

export type ContentlayerOverrideArgs<TDocumentTypeNames extends string> = {
  documentTypes: Partial<{
    [TDocumentTypeName in TDocumentTypeNames]: ContentlayerOverrideDocumentType<TDocumentTypeName>
  }>
}

export type ContentlayerOverrideDocumentType<TDocumentTypeName extends string> = {
  filePathPattern?: string
  computedFields?: SourceFiles.ComputedFields<TDocumentTypeName>
}

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
export const loadStackbitConfigAsDocumentTypes = <TDocumentTypeNames extends GetDocumentTypeNamesGen>(
  options: Stackbit.ConfigLoaderOptions = { dirPath: '' },
  overrideArgs: ContentlayerOverrideArgs<TDocumentTypeNames> = { documentTypes: {} },
): Promise<SourceFiles.DocumentType[]> =>
  Stackbit.loadConfig(options).then((configResult) => {
    if (configResult.errors.length > 0) {
      throw new Error(configResult.errors.join('\n'))
    }

    return stackbitConfigToDocumentTypes(configResult.config!, overrideArgs)
  })

/**
 *
 * @example
 * ```ts
 * // contentlayer.config.ts
 * import { makeSource } from 'contentlayer/source-files'
 * import { stackbitConfigToDocumentTypes } from '@contentlayer/source-files-stackbit'
 * import stackbitConfig from './stackbit.config.js'
 *
 * const documentTypes = stackbitConfigToDocumentTypes(stackbitConfig)
 *
 * export default makeSource({ contentDirPath: 'content', documentTypes })
 * ```
 */
export const stackbitConfigToDocumentTypes = <TDocumentTypeNames extends GetDocumentTypeNamesGen>(
  stackbitConfig: Stackbit.Config | Stackbit.YamlConfig,
  overrideArgs: ContentlayerOverrideArgs<TDocumentTypeNames> = { documentTypes: {} },
): SourceFiles.DocumentType[] => {
  const validatedStackbitConfig = validateStackbitConfig(stackbitConfig)

  // NOTE File-based content sources don't have image models
  const models = validatedStackbitConfig.models.filter(not(isImageModel))

  const [documentLikeModels, objectModels] = partition(models, isDocumentLikeModel)

  const ctx: SharedCtx = { documentTypeMap: {}, nestedTypeMap: {} }

  const documentTypes = documentLikeModels.map(stackbitDocumentLikeModelToDocumentType(ctx))

  objectModels.forEach((model) => {
    const nestedType = stackbitObjectModelToDocumentType(ctx)(model)
    ctx.nestedTypeMap[model.name] = nestedType
  })

  documentTypes.forEach((documentType) => {
    const documentTypeName = documentType.def().name
    ctx.documentTypeMap[documentTypeName] = documentType

    const documentOverride = (overrideArgs.documentTypes as any)[documentTypeName]
    if (documentOverride) {
      patchDocumentType(documentType, documentOverride)
    }
  })

  return documentTypes
}

const patchDocumentType = (
  documentType: SourceFiles.DocumentType,
  patch: Partial<SourceFiles.DocumentTypeDef>,
): void => {
  const previousDef = documentType.def()
  documentType.def = defineDocumentType(() => ({ ...previousDef, ...patch })).def
}

const validateStackbitConfig = (stackbitConfig: Stackbit.Config | Stackbit.YamlConfig): Stackbit.Config => {
  if (Array.isArray(stackbitConfig.models)) {
    return stackbitConfig as Stackbit.Config
  }

  const stackbitConfigResult = validateAndNormalizeConfig(stackbitConfig)

  if (stackbitConfigResult.errors.length > 0) {
    throw new Error(stackbitConfigResult.errors.join('\n'))
  }

  return stackbitConfigResult.config
}

const isDocumentLikeModel = (
  model: Stackbit.Model,
): model is Stackbit.PageModel | Stackbit.DataModel | Stackbit.ConfigModel =>
  model.type === 'data' || model.type === 'page' || model.type === 'config'

const isImageModel = (model: Stackbit.Model): model is Stackbit.ImageModel => model.type === 'image'
