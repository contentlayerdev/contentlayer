import type * as Core from '@contentlayer/core'
import type { PluginExtensions, StackbitExtension } from '@contentlayer/core'
import { casesHandled, partition } from '@contentlayer/utils'
import type * as Stackbit from '@stackbit/sdk'

export const convertSchema = (
  { documentTypeDefMap, nestedTypeDefMap }: Core.SchemaDef,
  extensions: PluginExtensions,
): Stackbit.YamlConfig => {
  // TODO this needs to be more dynamic/configurable
  const urlPathFieldName = 'url_path'
  const documentTypeDefs = Object.values(documentTypeDefMap)
  const [pageDocumentDefs, dataDocumentDefs] = partition(
    documentTypeDefs,
    (_) =>
      _.fieldDefs.some((_) => _.name === urlPathFieldName) || _.computedFields.some((_) => _.name === urlPathFieldName),
  )
  const pagesDir = extensions.stackbit?.pagesDir
  const dataDir = extensions.stackbit?.dataDir

  const models = [
    ...pageDocumentDefs.map((def) => documentOrObjectDefToStackbitYamlModel({ def, type: 'page', urlPathFieldName })),
    ...dataDocumentDefs.map((def) => documentOrObjectDefToStackbitYamlModel({ def, type: 'data', urlPathFieldName })),
    ...Object.values(nestedTypeDefMap).map((def) =>
      documentOrObjectDefToStackbitYamlModel({ def, type: 'object', urlPathFieldName }),
    ),
  ].reduce((acc, { model, name }) => ({ ...acc, [name]: model }), {} as Stackbit.YamlModels)

  return { stackbitVersion: '~0.3.0', nodeVersion: '>=12', models, pagesDir, dataDir }
}

const documentOrObjectDefToStackbitYamlModel = ({
  def,
  type,
}: {
  def: Core.DocumentTypeDef | Core.NestedTypeDef
  type: Stackbit.YamlModel['type']
  urlPathFieldName: string
}): { model: Stackbit.YamlModel; name: string } => {
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
  const modelCommon: Stackbit.YamlBaseModel = {
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
      return { name, model: { ...modelCommon, type: 'config', singleInstance } }
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
  fieldDef: Core.FieldDef
  fieldExtension: StackbitExtension.FieldExtension | undefined
}): Stackbit.Field => {
  const commonField: Stackbit.FieldCommonProps = {
    name: fieldDef.name,
    required: fieldDef.required,
    const: fieldExtension?.const,
    default: fieldDef.default,
    description: fieldDef.description,
    hidden: fieldExtension?.hidden,
    label: fieldExtension?.label,
  }
  switch (fieldDef.type) {
    case 'enum':
      return { ...commonField, type: 'enum', options: fieldDef.options }
    case 'document':
      return { ...commonField, type: 'reference', models: [fieldDef.documentTypeName] }
    case 'nested':
      return { ...commonField, type: 'model', models: [fieldDef.nestedTypeName] }
    case 'unnamed_nested':
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
    case 'polymorphic_list':
      return { ...commonField, type: 'list', items: listFieldDefToStackbitFieldListItems(fieldDef) }
    case 'date':
    case 'number':
    case 'string':
    case 'markdown':
    case 'text':
    case 'slug':
    case 'image':
    case 'url':
    case 'boolean':
      return { ...commonField, type: fieldDef.type }
    case 'mdx':
      throw new Error(`MDX isn't supported yet`)
    default:
      casesHandled(fieldDef)
  }
}

const listFieldDefToStackbitFieldListItems = (
  fieldDef: Core.ListFieldDef | Core.PolymorphicListFieldDef,
): Stackbit.FieldListItems => {
  const getModelName = (item: Core.ListFieldDefItem.ItemNested | Core.ListFieldDefItem.ItemReference) =>
    item.type === 'document' ? item.documentName : item.nestedTypeName

  if (fieldDef.type === 'list' && (fieldDef.of.type === 'document' || fieldDef.of.type === 'nested')) {
    return {
      type: 'model',
      models: [getModelName(fieldDef.of)],
    }
  }

  if (fieldDef.type === 'polymorphic_list' && fieldDef.typeField !== 'type') {
    // TODO make more configurable via global `objectTypeKey` option
    // https://www.stackbit.com/docs/stackbit-yaml/properties/#objecttypekey
    throw new Error(
      `typeField needs to be called "type" in order to be supported by Stackbit. typeField found: "${fieldDef.typeField}"`,
    )
  }

  if (
    fieldDef.type === 'polymorphic_list' &&
    fieldDef.of.every(
      (_): _ is Core.ListFieldDefItem.ItemReference | Core.ListFieldDefItem.ItemNested =>
        _.type === 'document' || _.type === 'nested',
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
      case 'unnamed_nested':
        return {
          type: 'object',
          fields: fieldDef.of.typeDef.fieldDefs
            .filter(not(isContentMarkdownFieldDef))
            .map((fieldDef) => fieldDefToStackbitField({ fieldDef, fieldExtension: undefined })),
        }
      case 'enum':
        return { type: 'enum', options: fieldDef.of.options }
      case 'nested':
      case 'document':
        throw new Error('Case handled above')
      default:
        casesHandled(fieldDef.of)
    }
  }

  throw new Error(`Not implemented ${JSON.stringify(fieldDef)}`)
}

const not =
  <Fn extends (...args: any[]) => boolean>(fn: Fn) =>
  (...args: Parameters<Fn>) =>
    !fn(...args)

const isContentMarkdownFieldDef = (fieldDef: Core.FieldDef) =>
  fieldDef.name === 'content' && fieldDef.type === 'markdown'
