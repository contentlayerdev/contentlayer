import type * as core from '@contentlayer/core'
import * as utils from '@contentlayer/utils'
import { identity } from '@contentlayer/utils/effect'
import type * as Stackbit from '@stackbit/sdk'

import type { StackbitExtension, StackbitExtensionField } from '../types/index.js'

export const convertSchema = ({
  schema,
  fieldOptions,
  extensions,
}: {
  schema: core.SchemaDef
  fieldOptions: core.FieldOptions
  extensions: StackbitExtension['root']
}): Stackbit.YamlConfig => {
  const { documentTypeDefMap, nestedTypeDefMap } = schema
  const documentTypeDefs = Object.values(documentTypeDefMap)
  const [pageDocumentDefs, dataDocumentDefs] = utils.partition(
    documentTypeDefs,
    (_) => _.extensions.stackbit?.isPage ?? false,
  )

  const pageModels = pageDocumentDefs.map((def) =>
    documentOrObjectDefToStackbitYamlModel({ def, type: 'page', fieldOptions }),
  )
  const dataModels = dataDocumentDefs.map((def) =>
    documentOrObjectDefToStackbitYamlModel({ def, type: 'data', fieldOptions }),
  )
  const objectModels = Object.values(nestedTypeDefMap).map((def) =>
    documentOrObjectDefToStackbitYamlModel({ def, type: 'object', fieldOptions }),
  )

  const models = Object.fromEntries(
    [...pageModels, ...dataModels, ...objectModels].map(({ model, name }) => [name, model]),
  )

  const contentModels = Object.fromEntries(
    pageDocumentDefs.flatMap((def) => {
      const ext = def.extensions.stackbit

      if (ext?.isPage === true) {
        const contentModel = identity<Stackbit.ContentModel>({
          isPage: true,
          newFilePath: ext?.newFilePath,
          urlPath: ext?.urlPath,
          exclude: ext?.exclude,
          file: ext?.file,
          folder: ext?.folder,
          hideContent: ext?.hideContent,
          match: ext?.match,
          singleInstance: ext?.singleInstance,
        })

        return [[def.name, contentModel]]
      }

      return []
    }),
  )

  const { pageLayoutKey, ...restExtensions } = extensions

  return identity<Stackbit.YamlConfig>({
    stackbitVersion: '~0.4.0',
    nodeVersion: '>=14',
    cmsName: 'git',
    ssgName: 'nextjs',
    objectTypeKey: 'type',
    ...restExtensions,
    pageLayoutKey: pageLayoutKey ?? fieldOptions.typeFieldName,
    models,
    contentModels,
  })
}

type GetStackbitYamlModel<TType> = TType extends 'page'
  ? Stackbit.YamlPageModel
  : TType extends 'object'
  ? Stackbit.ObjectModel
  : TType extends 'data'
  ? Stackbit.DataModel
  : never

const documentOrObjectDefToStackbitYamlModel = <TType extends Exclude<Stackbit.YamlModel['type'], 'config'>>({
  def,
  type,
  fieldOptions,
}: {
  def: core.DocumentTypeDef | core.NestedTypeDef
  type: TType
  fieldOptions: core.FieldOptions
}): { model: GetStackbitYamlModel<TType>; name: string } => {
  const ext = def.extensions.stackbit
  const fields =
    def._tag === 'DocumentTypeDef'
      ? def.fieldDefs.filter(not(isContentMarkdownFieldDef(fieldOptions.bodyFieldName))).map((fieldDef) =>
          fieldDefToStackbitField({
            fieldDef,
            fieldExtension: fieldDef.extensions.stackbit ?? ext?.fields?.[fieldDef.name],
            fieldOptions,
          }),
        )
      : def.fieldDefs.map((fieldDef) =>
          fieldDefToStackbitField({
            fieldDef,
            fieldExtension: fieldDef.extensions.stackbit ?? ext?.fields?.[fieldDef.name],
            fieldOptions,
          }),
        )

  const options = {
    match: ext?.match,
    folder: ext?.folder,
    file: ext?.file,
  }
  const modelCommon: Omit<Stackbit.YamlBaseModel, 'type'> = {
    label: ext?.label ?? def.name,
    labelField: ext?.labelField,
    description: def.description,
    fields,
    ...options,
  }

  const name = def.name
  const isSingleInstance =
    ext?.singleInstance !== undefined ? ext.singleInstance : def._tag === 'DocumentTypeDef' && def.isSingleton

  const singleInstance = isSingleInstance ? { singleInstance: true } : {}

  switch (type) {
    case 'data':
      return { name, model: identity<Stackbit.YamlDataModel>({ ...modelCommon, ...singleInstance, type: 'data' }) } as {
        model: GetStackbitYamlModel<TType>
        name: string
      }
    case 'object':
      return { name, model: identity<Stackbit.YamlObjectModel>({ ...modelCommon, type: 'object' }) } as {
        model: GetStackbitYamlModel<TType>
        name: string
      }
    case 'page':
      return { name, model: identity<Stackbit.YamlPageModel>({ ...modelCommon, ...singleInstance, type: 'page' }) } as {
        model: GetStackbitYamlModel<TType>
        name: string
      }
    default:
      utils.casesHandled(type)
  }
}

const fieldDefToStackbitField = ({
  fieldDef,
  fieldExtension,
  fieldOptions,
}: {
  fieldDef: core.FieldDef
  fieldExtension: StackbitExtensionField | undefined
  fieldOptions: core.FieldOptions
}): Stackbit.Field => {
  const commonField: Omit<Stackbit.FieldCommonProps, 'type'> = {
    name: fieldDef.name,
    required: fieldDef.isRequired,
    const: fieldExtension?.const,
    default: fieldExtension?.initialValue,
    description: fieldDef.description,
    hidden: fieldExtension?.hidden,
    label: fieldExtension?.label,
    group: fieldExtension?.group,
    readOnly: fieldExtension?.readOnly,
  }
  switch (fieldDef.type) {
    case 'enum':
      return { ...commonField, type: 'enum', options: fieldDef.options as string[] }
    case 'reference':
      return { ...commonField, type: 'reference', models: [fieldDef.documentTypeName] }
    case 'reference_polymorphic':
      return { ...commonField, type: 'reference', models: fieldDef.documentTypeNames as string[] }
    case 'nested':
      return { ...commonField, type: 'model', models: [fieldDef.nestedTypeName] }
    case 'nested_polymorphic':
      return { ...commonField, type: 'model', models: fieldDef.nestedTypeNames as string[] }
    case 'nested_unnamed':
      return {
        ...commonField,
        type: 'object',
        fields: fieldDef.typeDef.fieldDefs
          .filter(not(isContentMarkdownFieldDef(fieldOptions.bodyFieldName)))
          .map((fieldDef) => fieldDefToStackbitField({ fieldDef, fieldExtension: undefined, fieldOptions })),
      }
    case 'json':
      return { ...commonField, type: 'object', fields: [] }
    case 'list':
    case 'list_polymorphic':
      return { ...commonField, type: 'list', items: listFieldDefToStackbitFieldListItems(fieldDef, fieldOptions) }
    case 'date':
    case 'number':
    case 'string':
    case 'markdown':
    case 'boolean':
      return { ...commonField, type: fieldDef.type }
    case 'mdx':
      throw new Error(`MDX isn't supported yet`)
    default:
      utils.casesHandled(fieldDef)
  }
}

const listFieldDefToStackbitFieldListItems = (
  fieldDef: core.ListFieldDef | core.ListPolymorphicFieldDef,
  fieldOptions: core.FieldOptions,
): Stackbit.FieldListItems => {
  const getModelName = (item: core.ListFieldDefItem.ItemNested | core.ListFieldDefItem.ItemReference) =>
    item.type === 'reference' ? item.documentTypeName : item.nestedTypeName

  if (fieldDef.type === 'list' && (fieldDef.of.type === 'reference' || fieldDef.of.type === 'nested')) {
    return {
      type: 'model',
      models: [getModelName(fieldDef.of)],
    }
  }

  if (fieldDef.type === 'list_polymorphic' && fieldDef.typeField !== 'type') {
    // TODO make more configurable via global `objectTypeKey` option
    // https://www.stackbit.com/docs/stackbit-yaml/properties/#objecttypekey
    throw new Error(
      `typeField needs to be called "type" in order to be supported by Stackbit. Stackbit config option "objectTypeKey" isn't supported yet. typeField found: "${fieldDef.typeField}"`,
    )
  }

  if (
    fieldDef.type === 'list_polymorphic' &&
    fieldDef.of.every(
      (_): _ is core.ListFieldDefItem.ItemReference | core.ListFieldDefItem.ItemNested =>
        _.type === 'reference' || _.type === 'nested',
    )
  ) {
    return {
      type: 'model',
      models: fieldDef.of.map(getModelName),
    }
  }

  if (fieldDef.type === 'list') {
    switch (fieldDef.of.type) {
      case 'string':
      case 'boolean':
        return { type: fieldDef.of.type }
      case 'nested_unnamed':
        return {
          type: 'object',
          fields: fieldDef.of.typeDef.fieldDefs
            .filter(not(isContentMarkdownFieldDef(fieldOptions.bodyFieldName)))
            .map((fieldDef) => fieldDefToStackbitField({ fieldDef, fieldExtension: undefined, fieldOptions })),
        }
      case 'enum':
        return { type: 'enum', options: fieldDef.of.options as string[] }
      case 'nested':
      case 'reference':
        throw new Error('Case handled above')
      default:
        utils.casesHandled(fieldDef.of)
    }
  }

  throw new Error(`Not implemented ${JSON.stringify(fieldDef)}`)
}

const not =
  <Fn extends (...args: any[]) => boolean>(fn: Fn) =>
  (...args: Parameters<Fn>) =>
    !fn(...args)

const isContentMarkdownFieldDef = (bodyFieldName: string) => (fieldDef: core.FieldDef) =>
  fieldDef.name === bodyFieldName && (fieldDef.type === 'markdown' || fieldDef.type === 'mdx')
