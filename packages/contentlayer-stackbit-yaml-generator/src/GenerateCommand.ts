import type * as Core from '@contentlayer/core'
import { assertUnreachable, getConfig } from '@contentlayer/core'
import { partition, recRemoveUndefinedValues } from '@contentlayer/utils'
import type * as Stackbit from '@stackbit/sdk'
import { Command, Option } from 'clipanion'
import { promises as fs } from 'fs'
import * as path from 'path'
import * as t from 'typanion'
import * as YAML from 'yaml'

const defaultYamlPath = () => `${path.join(process.cwd())}/stackbit.yaml`

export class GenerateCommand extends Command {
  // static paths = [['generate']]

  configPath = Option.String('-c,--config', {
    required: true,
    description: 'Path to the Contentlayer config',
    validator: t.isString(),
  })

  yamlPath = Option.String('-s,--stackbit', defaultYamlPath(), {
    description: 'Target path for Stackbit YAML file',
    validator: t.isString(),
  })

  async execute() {
    try {
      await this.executeSafe()
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async executeSafe() {
    const config = await getConfig({ configPath: this.configPath, cwd: process.cwd() })
    const schema = await config.source.provideSchema()
    const stackbitConfig = convertSchema(schema)
    recRemoveUndefinedValues(stackbitConfig)
    const yamlContent = YAML.stringify(stackbitConfig)
    await fs.writeFile(this.yamlPath, yamlContent)
    console.log(`Stackbit config generated to ${this.yamlPath}`)
  }
}

const convertSchema = ({ documentDefMap, objectDefMap }: Core.SchemaDef): Stackbit.YamlConfig => {
  // TODO this needs to be more dynamic/configurable
  const urlPathFieldName = 'url_path'
  const documentDefs = Object.values(documentDefMap)
  const [pageDocumentDefs, dataDocumentDefs] = partition(
    documentDefs,
    (_) =>
      _.fieldDefs.some((_) => _.name === urlPathFieldName) || _.computedFields.some((_) => _.name === urlPathFieldName),
  )

  const models = [
    ...pageDocumentDefs.map((def) => documentDefToStackbitYamlModel({ def, type: 'page', urlPathFieldName })),
    ...dataDocumentDefs.map((def) => documentDefToStackbitYamlModel({ def, type: 'data', urlPathFieldName })),
    ...Object.values(objectDefMap).map((def) =>
      documentDefToStackbitYamlModel({ def, type: 'object', urlPathFieldName }),
    ),
  ].reduce((acc, { model, name }) => ({ ...acc, [name]: model }), {} as Stackbit.YamlModels)

  return { stackbitVersion: '~0.3.0', models, nodeVersion: '>=12' }
}

const documentDefToStackbitYamlModel = ({
  def,
  type,
}: {
  def: Core.DocumentDef | Core.ObjectDef
  type: Stackbit.YamlModel['type']
  urlPathFieldName: string
}): { model: Stackbit.YamlModel; name: string } => {
  const name = def.name
  const modelCommon: Stackbit.YamlBaseModel = {
    label: def.label,
    labelField: def.labelField,
    description: def.description,
    fields: def.fieldDefs.map(fieldDefToStackbitField),
  }

  switch (type) {
    case 'data':
      return { name, model: { ...modelCommon, type: 'data' } }
    case 'config':
      return { name, model: { ...modelCommon, type: 'config' } }
    case 'object':
      return { name, model: { ...modelCommon, type: 'object' } }
    case 'page':
      return { name, model: { ...modelCommon, type: 'page' } }
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
      return { ...commonField, type: 'object', fields: fieldDef.fieldDefs.map(fieldDefToStackbitField) }
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
    default:
      assertUnreachable(fieldDef)
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
        return { type: 'object', fields: fieldDef.of.fieldDefs.map(fieldDefToStackbitField) }
      case 'enum':
        return { type: 'enum', options: fieldDef.of.options }
      case 'object':
      case 'reference':
        throw new Error('Case handled above')
      default:
        assertUnreachable(fieldDef.of)
    }
  }

  throw new Error(`Not implemented ${JSON.stringify(fieldDef)}`)
}
