import type * as core from '@contentlayer/core'
import * as utils from '@contentlayer/utils'
import type * as Stackbit from '@stackbit/sdk'
import type * as StackbitTypes from '@stackbit/types'

export const convertSchema = (
  { documentTypeDefMap, nestedTypeDefMap }: core.SchemaDef,
  extensions: core.PluginExtensions,
): StackbitTypes.StackbitConfig => {
  // TODO this needs to be more dynamic/configurable
  const urlPathFieldName = 'url_path'
  const documentTypeDefs = Object.values(documentTypeDefMap)
  const [pageDocumentDefs, dataDocumentDefs] = utils.partition(
    documentTypeDefs,
    (_): _ is core.DocumentTypeDef =>
      _.fieldDefs.some((_) => _.name === urlPathFieldName) || _.computedFields.some((_) => _.name === urlPathFieldName),
  )
  const pagesDir = extensions.stackbit?.pagesDir
  const dataDir = extensions.stackbit?.dataDir

  const models = Object.fromEntries(
    [
      ...pageDocumentDefs.map((def) => documentOrObjectDefToStackbitYamlModel({ def, type: 'page', urlPathFieldName })),
      ...dataDocumentDefs.map((def) => documentOrObjectDefToStackbitYamlModel({ def, type: 'data', urlPathFieldName })),
      ...Object.values(nestedTypeDefMap).map((def) =>
        documentOrObjectDefToStackbitYamlModel({ def, type: 'object', urlPathFieldName }),
      ),
    ].map(({ model, name }) => [name, model]),
  )

  return { stackbitVersion: '~0.3.0', nodeVersion: '>=12', models, pagesDir, dataDir }
}

const documentOrObjectDefToStackbitYamlModel = ({
  def,
  type,
}: {
  def: core.DocumentTypeDef | core.NestedTypeDef
  type: Stackbit.YamlModel['type']
  urlPathFieldName: string
}): { model: StackbitTypes.NamelessModel; name: string } => {
  const ext = def.extensions.stackbit
  const fields =
    def._tag === 'DocumentTypeDef'
      ? def.fieldDefs
          .filter(not(isContentMarkdownFieldDef))
          .map((fieldDef) => fieldDefToStackbitField({ fieldDef, fieldExtension: ext?.fields?.[fieldDef.name] }))
      : def.fieldDefs.map((fieldDef) =>
          fieldDefToStackbitField({ fieldDef, fieldExtension: ext?.fields?.[fieldDef.name] }),
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
  const singleInstance: any = def._tag === 'DocumentTypeDef' && def.isSingleton

  switch (type) {
    case 'data':
      return { name, model: { ...modelCommon, type: 'data', singleInstance } }
    case 'config':
      //   return { name, model: { ...modelCommon, type: 'config', singleInstance } }
      throw new Error('Config models are not supported anymore')
    case 'object':
      return { name, model: { ...modelCommon, type: 'object' } }
    case 'page':
      return { name, model: { ...modelCommon, type: 'page', singleInstance } }
  }
}

const fieldDefToStackbitField = ({
  fieldDef,
  fieldExtension,
}: {
  fieldDef: core.FieldDef
  fieldExtension: core.StackbitExtension.FieldExtension | undefined
}): Stackbit.Field => {
  const commonField: Omit<Stackbit.FieldCommonProps, 'type'> = {
    name: fieldDef.name,
    required: fieldDef.isRequired,
    const: fieldExtension?.const,
    default: fieldDef.default,
    description: fieldDef.description,
    hidden: fieldExtension?.hidden,
    label: fieldExtension?.label,
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
          .filter(not(isContentMarkdownFieldDef))
          .map((fieldDef) => fieldDefToStackbitField({ fieldDef, fieldExtension: undefined })),
      }
    case 'json':
      return { ...commonField, type: 'object', fields: [] }
    case 'list':
    case 'list_polymorphic':
      // @ts-expect-error TODO fix this together with some help from Stackbit
      return { ...commonField, type: 'list', items: listFieldDefToStackbitFieldListItems(fieldDef) }
    case 'image':
      return { ...commonField, type: 'string' }
    case 'date':
    case 'number':
    case 'string':
    case 'markdown':
    // case 'text':
    // case 'slug':
    // case 'image':
    // case 'url':
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
): Stackbit.FieldListItems => {
  const getModelName = (item: core.ListFieldDefItem.ItemNested | core.ListFieldDefItem.ItemDocumentReference) =>
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
      `typeField needs to be called "type" in order to be supported by Stackbit. typeField found: "${fieldDef.typeField}"`,
    )
  }

  if (
    fieldDef.type === 'list_polymorphic' &&
    fieldDef.of.every(
      (_): _ is core.ListFieldDefItem.ItemDocumentReference | core.ListFieldDefItem.ItemNested =>
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
      case 'number':
        return { type: fieldDef.of.type }
      case 'nested_unnamed':
        return {
          type: 'object',
          fields: fieldDef.of.typeDef.fieldDefs
            .filter(not(isContentMarkdownFieldDef))
            .map((fieldDef) => fieldDefToStackbitField({ fieldDef, fieldExtension: undefined })),
        }
      case 'enum':
        return { type: 'enum', options: fieldDef.of.options as string[] }
      case 'nested':
      case 'reference':
        throw new Error('Case handled above')
      case 'json':
      case 'markdown':
      case 'mdx':
      case 'date':
      case 'image':
        throw new Error('Not yet implemented')
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

const isContentMarkdownFieldDef = (fieldDef: core.FieldDef) =>
  fieldDef.name === 'content' && fieldDef.type === 'markdown'
