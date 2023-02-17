import * as SourceFiles from '@contentlayer/source-files'
import { casesHandled, isReadonlyArray, notImplemented, pick } from '@contentlayer/utils'
import { identity } from '@contentlayer/utils/effect'
import type * as Stackbit from '@stackbit/sdk'

type DocumentTypeMap = Record<string, SourceFiles.DocumentType>
type NestedTypeMap = Record<string, SourceFiles.NestedType>

export type SharedCtx = {
  documentTypeMap: DocumentTypeMap
  nestedTypeMap: NestedTypeMap
}

export const stackbitDocumentLikeModelToDocumentType =
  (ctx: SharedCtx) =>
  (stackbitModel: Stackbit.PageModel | Stackbit.DataModel | Stackbit.ConfigModel): SourceFiles.DocumentType => {
    return SourceFiles.defineDocumentType(() => ({
      name: stackbitModel.name,
      description: stackbitModel.description,
      fields: (stackbitModel.fields ?? []).map(stackbitFieldToField(ctx)),
      isSingleton: stackbitModel.type === 'config' || stackbitModel.singleInstance === true,
    }))
  }

export const stackbitObjectModelToDocumentType =
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
      // TODO don't map Stackbit `default` to Contentlayer `default`
      // See https://github.com/contentlayerdev/contentlayer/issues/120
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
      case 'cross-reference':
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
      case 'number':
        type Item =
          | SourceFiles.ListFieldDefItem.ItemString
          | SourceFiles.ListFieldDefItem.ItemBoolean
          | SourceFiles.ListFieldDefItem.ItemNumber
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
        return identity<SourceFiles.ListFieldDefItem.ItemNestedType>({
          type: 'nested',
          def: () => ({ fields: stackbitListItem.fields.map(stackbitFieldToField(ctx)) }),
        })
      case 'date':
      case 'datetime':
        return identity<SourceFiles.ListFieldDefItem.ItemDate>({ type: 'date' })
      case 'json':
        return identity<SourceFiles.ListFieldDefItem.ItemJSON>({ type: 'json' })
      case 'markdown':
        return identity<SourceFiles.ListFieldDefItem.ItemMarkdown>({ type: 'markdown' })
      case 'image':
        return identity<SourceFiles.ListFieldDefItem.ItemImage>({ type: 'image' })
      case 'url':
      case 'text':
      case 'color':
      case 'slug':
      case 'html':
      case 'file':
        return identity<SourceFiles.ListFieldDefItem.ItemString>({ type: 'string' })
      case 'richText':
      case 'cross-reference':
        notImplemented(`richText doesn't exist in the "files" content source`)
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

const firstArrayItemIfOne = <T>(array: readonly T[]): T | readonly T[] => (array.length === 1 ? array[0]! : array)
