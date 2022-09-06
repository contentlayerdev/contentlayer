import * as SourceFiles from '@contentlayer/source-files'
import { casesHandled, isReadonlyArray, not, notImplemented, partition, pick } from '@contentlayer/utils'
import { identity } from '@contentlayer/utils/effect'
import * as Stackbit from '@stackbit/sdk'
import { validateAndNormalizeConfig } from '@stackbit/sdk/dist/config/config-loader.js'

export { addComputedFields } from './addComputedFields.js'

type DocumentTypeMap = Record<string, SourceFiles.DocumentType>
type NestedTypeMap = Record<string, SourceFiles.NestedType>
type SharedCtx = {
  documentTypeMap: DocumentTypeMap
  nestedTypeMap: NestedTypeMap
}

/**
 * @example
 * ```ts
 * import { makeSource } from 'contentlayer/source-files'
 * import { loadStackbitConfigAsDocumentTypes } from '@contentlayer/experimental-source-files-stackbit'
 *
 * export default loadStackbitConfigAsDocumentTypes().then((documentTypes) => {
 *   return makeSource({ contentDirPath: 'content', documentTypes })
 * })
 * ```
 */
export const loadStackbitConfigAsDocumentTypes = (
  options: Stackbit.ConfigLoaderOptions = { dirPath: '' },
): Promise<SourceFiles.DocumentType[]> =>
  Stackbit.loadConfig(options).then((configResult) => {
    if (configResult.errors.length > 0) {
      throw new Error(configResult.errors.join('\n'))
    }

    return stackbitConfigToDocumentTypes(configResult.config!)
  })

/**
 *
 * @example
 * ```ts
 * import { makeSource } from 'contentlayer/source-files'
 * import { stackbitConfigToDocumentTypes } from '@contentlayer/source-files-stackbit'
 * import stackbitConfig from './stackbit.config.js'
 *
 * const documentTypes = stackbitConfigToDocumentTypes(stackbitConfig)
 *
 * export default makeSource({ contentDirPath: 'content', documentTypes })
 * ```
 */
export const stackbitConfigToDocumentTypes = (
  stackbitConfig: Stackbit.Config | Stackbit.YamlConfig,
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
    ctx.documentTypeMap[documentType.def().name] = documentType
  })

  return documentTypes
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

const stackbitDocumentLikeModelToDocumentType =
  (ctx: SharedCtx) =>
  (stackbitModel: Stackbit.PageModel | Stackbit.DataModel | Stackbit.ConfigModel): SourceFiles.DocumentType => {
    return SourceFiles.defineDocumentType(() => ({
      name: stackbitModel.name,
      description: stackbitModel.description,
      fields: (stackbitModel.fields ?? []).map(stackbitFieldToField(ctx)),
      isSingleton: stackbitModel.type === 'config' || stackbitModel.singleInstance === true,
    }))
  }

const stackbitObjectModelToDocumentType =
  (ctx: SharedCtx) =>
  (stackbitModel: Stackbit.ObjectModel): SourceFiles.NestedType => {
    return SourceFiles.defineNestedType(() => ({
      name: stackbitModel.name,
      description: stackbitModel.description,
      fields: (stackbitModel.fields ?? []).map(stackbitFieldToField(ctx)),
    }))
  }

const stackbitFieldToField =
  (ctx: SharedCtx) =>
  (stackbitField: Stackbit.Field): SourceFiles.FieldDefWithName => {
    const commonFields = {
      ...pick(stackbitField, ['name', 'description', 'required']),
      default: stackbitField.default as any,
    }

    type WithName<T> = T & { name: string }

    switch (stackbitField.type) {
      case 'boolean':
      case 'number':
        type FieldDef = SourceFiles.BooleanFieldDef | SourceFiles.NumberFieldDef
        return identity<WithName<FieldDef>>({ ...commonFields, type: stackbitField.type })
      case 'enum':
        return identity<WithName<SourceFiles.EnumFieldDef>>({
          ...commonFields,
          type: 'enum',
          options: stackbitField.options.map(mapStackbitEnumOption),
        })
      case 'style':
        return identity<WithName<SourceFiles.JSONFieldDef>>({ ...commonFields, type: 'json' })
      case 'list': {
        const of = stackbitListItemToListFieldDef(ctx)(stackbitField.items!)
        return isReadonlyArray(of)
          ? identity<WithName<SourceFiles.ListPolymorphicFieldDef>>({
              ...commonFields,
              type: 'list',
              of,
              typeField: 'type',
            })
          : identity<WithName<SourceFiles.ListFieldDef>>({ ...commonFields, type: 'list', of })
      }
      case 'reference': {
        const of = stackbitField.models.map((modelName) => ctx.documentTypeMap[modelName]!)
        if (of.length === 1) {
          return identity<WithName<SourceFiles.ReferenceFieldDef>>({ ...commonFields, type: 'reference', of: of[0]! })
        }
        return identity<WithName<SourceFiles.ReferencePolymorphicFieldDef>>({
          ...commonFields,
          type: 'reference',
          of,
          typeField: 'type',
        })
      }
      case 'model': {
        const of = stackbitField.models.map((modelName) => ctx.nestedTypeMap[modelName]!)
        if (of.length === 1) {
          return identity<WithName<SourceFiles.NestedFieldDef>>({ ...commonFields, type: 'nested', of: of[0]! })
        }
        return identity<WithName<SourceFiles.NestedPolymorphicFieldDef>>({
          ...commonFields,
          type: 'nested',
          of,
          typeField: 'type',
        })
      }
      case 'object': {
        const unnamedNestedTypeDef = identity<SourceFiles.NestedUnnamedTypeDef>({
          fields: stackbitField.fields.map(stackbitFieldToField(ctx)),
        })
        return identity<WithName<SourceFiles.NestedFieldDef>>({
          ...commonFields,
          type: 'nested',
          of: { type: 'nested', def: () => unnamedNestedTypeDef },
        })
      }
      case 'markdown':
        return identity<WithName<SourceFiles.MarkdownFieldDef>>({ ...commonFields, type: 'markdown' })
      case 'json':
        return identity<WithName<SourceFiles.JSONFieldDef>>({ ...commonFields, type: 'json' })
      case 'image':
        return identity<WithName<SourceFiles.ImageFieldDef>>({ ...commonFields, type: 'image' })
      case 'datetime':
      case 'date':
        return identity<WithName<SourceFiles.DateFieldDef>>({ ...commonFields, type: 'date' })
      case 'string':
      case 'url':
      case 'text':
      case 'color':
      case 'slug':
      case 'html':
      case 'file':
        return identity<WithName<SourceFiles.StringFieldDef>>({ ...commonFields, type: 'string' })
      case 'richText':
        notImplemented(`richText doesn't exist in the "files" content source`)
      default:
        casesHandled(stackbitField)
    }
  }

const stackbitListItemToListFieldDef =
  (ctx: SharedCtx) =>
  (
    stackbitListItem: Stackbit.FieldListItems,
  ): SourceFiles.ListFieldDefItem.Item | readonly SourceFiles.ListFieldDefItem.Item[] => {
    switch (stackbitListItem.type) {
      case 'boolean':
      case 'string':
        type Item = SourceFiles.ListFieldDefItem.ItemString | SourceFiles.ListFieldDefItem.ItemBoolean
        return identity<Item>({ type: stackbitListItem.type })
      case 'enum':
        return identity<SourceFiles.ListFieldDefItem.ItemEnum>({
          type: 'enum',
          options: stackbitListItem.options.map(mapStackbitEnumOption),
        })
      case 'reference':
        return firstArrayItemIfOne(
          stackbitListItem.models.map((modelName) =>
            identity<SourceFiles.ListFieldDefItem.ItemDocumentReference>(ctx.documentTypeMap[modelName]!),
          ),
        )
      case 'model':
        return firstArrayItemIfOne(
          stackbitListItem.models.map((modelName) =>
            identity<SourceFiles.ListFieldDefItem.ItemNestedType>(ctx.nestedTypeMap[modelName]!),
          ),
        )
      case 'object':
      case 'number':
      case 'file':
      case 'image':
      case 'json':
      case 'date':
      case 'markdown':
      case 'url':
      case 'slug':
      case 'text':
      case 'html':
      case 'datetime':
      case 'color':
      case 'richText':
        notImplemented(stackbitListItem.type)
      default:
        casesHandled(stackbitListItem)
    }
  }

const mapStackbitEnumOption = (option: Stackbit.FieldEnumOptionValue | Stackbit.FieldEnumOptionObject): string => {
  if (typeof option === 'string' || typeof option === 'number') {
    return option.toString()
  }
  return option.value.toString()
}

const isDocumentLikeModel = (
  model: Stackbit.Model,
): model is Stackbit.PageModel | Stackbit.DataModel | Stackbit.ConfigModel =>
  model.type === 'data' || model.type === 'page' || model.type === 'config'

const isImageModel = (model: Stackbit.Model): model is Stackbit.ImageModel => model.type === 'image'

const firstArrayItemIfOne = <T>(array: readonly T[]): T | readonly T[] => (array.length === 1 ? array[0]! : array)
