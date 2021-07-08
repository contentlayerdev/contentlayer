import type * as Core from '@contentlayer/core'
import { casesHandled, partition } from '@contentlayer/utils'
import type * as Stackbit from '@stackbit/sdk'

export const convertSchema = ({ documentDefMap, objectDefMap }: Core.SchemaDef): Stackbit.YamlConfig => {
  // TODO this needs to be more dynamic/configurable
  const urlPathFieldName = 'url_path'
  const documentDefs = Object.values(documentDefMap)
  const [pageDocumentDefs, dataDocumentDefs] = partition(
    documentDefs,
    (_) =>
      _.fieldDefs.some((_) => _.name === urlPathFieldName) || _.computedFields.some((_) => _.name === urlPathFieldName),
  )

  const models = [
    ...pageDocumentDefs.map((def) => documentOrObjectDefToStackbitYamlModel({ def, type: 'page', urlPathFieldName })),
    ...dataDocumentDefs.map((def) => documentOrObjectDefToStackbitYamlModel({ def, type: 'data', urlPathFieldName })),
    ...Object.values(objectDefMap).map((def) =>
      documentOrObjectDefToStackbitYamlModel({ def, type: 'object', urlPathFieldName }),
    ),
  ].reduce((acc, { model, name }) => ({ ...acc, [name]: model }), {} as Stackbit.YamlModels)

  return { stackbitVersion: '~0.3.0', nodeVersion: '>=12', models }
}

const documentOrObjectDefToStackbitYamlModel = ({
  def,
  type,
}: {
  def: Core.DocumentDef | Core.ObjectDef
  type: Stackbit.YamlModel['type']
  urlPathFieldName: string
}): { model: Stackbit.YamlModel; name: string } => {
  const fields =
    def._tag === 'DocumentDef'
      ? def.fieldDefs.filter(not(isContentMarkdownFieldDef)).map(fieldDefToStackbitField)
      : def.fieldDefs.map(fieldDefToStackbitField)

  const modelCommon: Stackbit.YamlBaseModel = {
    label: def.label,
    labelField: def.labelField,
    description: def.description,
    fields,
  }

  const name = def.name
  const singleInstance: any = def._tag === 'DocumentDef' && def.isSingleton

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

const fieldDefToStackbitField = (fieldDef: Core.FieldDef): Stackbit.Field => {
  const commonField: Stackbit.FieldCommonProps = {
    name: fieldDef.name,
    required: fieldDef.required,
    const: fieldDef.const,
    default: fieldDef.default,
    description: fieldDef.description,
    hidden: fieldDef.hidden,
    label: fieldDef.label,
  }
  switch (fieldDef.type) {
    case 'enum':
      return { ...commonField, type: 'enum', options: fieldDef.options }
    case 'reference':
      return { ...commonField, type: 'reference', models: [fieldDef.documentName] }
    case 'inline_object':
      return {
        ...commonField,
        type: 'object',
        fields: fieldDef.fieldDefs.filter(not(isContentMarkdownFieldDef)).map(fieldDefToStackbitField),
      }
    case 'json':
      return { ...commonField, type: 'object', fields: [] }
    case 'object':
      return { ...commonField, type: 'model', models: [fieldDef.objectName] }
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
  const getModelName = (item: Core.ListFieldItemObject | Core.ListFieldItemReference) =>
    item.type === 'reference' ? item.documentName : item.objectName

  if (fieldDef.type === 'list' && (fieldDef.of.type === 'reference' || fieldDef.of.type === 'object')) {
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
      (_): _ is Core.ListFieldItemReference | Core.ListFieldItemObject => _.type === 'reference' || _.type === 'object',
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
      case 'inline_object':
        return {
          type: 'object',
          fields: fieldDef.of.fieldDefs.filter(not(isContentMarkdownFieldDef)).map(fieldDefToStackbitField),
        }
      case 'enum':
        return { type: 'enum', options: fieldDef.of.options }
      case 'object':
      case 'reference':
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
