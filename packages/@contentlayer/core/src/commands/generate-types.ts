import type { SourcePluginType } from '../plugin'
import type { DocumentDef, FieldDef, ListFieldDefItem, ObjectDef } from '../schema'

export const renderDocumentOrObjectDef = ({
  def,
  sourcePluginType,
}: {
  def: DocumentDef | ObjectDef
  sourcePluginType: SourcePluginType | 'unknown'
}): string => {
  const typeName = def.name
  const fieldDefs = def.fieldDefs.map(renderFieldDef).join('\n')
  const computedFields = (def._tag === 'DocumentDef' ? def.computedFields : [])
    .map((field) => `${field.description ? `  /** ${field.description} */\n` : ''}  ${field.name}: ${field.type}`)
    .join('\n')
  const description = def.description ?? def.label

  const rawType = renderRawType({ sourcePluginType })
  const idDocs = renderIdDocs({ sourcePluginType })

  return `\
${description ? `/** ${description} */\n` : ''}export type ${typeName} = {
  /** ${idDocs} */
  _id: string
  _typeName: '${typeName}'
  _raw: ${rawType}
${fieldDefs}
${computedFields}
}`
}

const renderIdDocs = ({ sourcePluginType }: { sourcePluginType: SourcePluginType }) => {
  switch (sourcePluginType) {
    case 'local':
      return 'File path relative to `contentDirPath`'
    case 'contentful':
      return 'Contentful object id'
    case 'sanity':
      return 'Sanity object id'
    default:
      return 'ID'
  }
}

const renderRawType = ({ sourcePluginType }: { sourcePluginType: SourcePluginType }) => {
  switch (sourcePluginType) {
    case 'local':
      return `Local.RawDocumentData`
    case 'contentful':
      return `Contentful.RawDocumentData`
    case 'sanity':
      return 'Record<string, any>'
    default:
      return 'Record<string, any>'
  }
}

const renderFieldDef = (field: FieldDef): string => {
  return `${field.description ? `  /** ${field.description} */\n` : ''}  ${field.name}: ${renderFieldType(field)}${
    field.required ? '' : ' | undefined'
  }`
}

const renderFieldType = (field: FieldDef): string => {
  switch (field.type) {
    case 'boolean':
    case 'string':
      return field.type
    case 'date':
      return 'string'
    // TODO but requires schema knowledge in the client
    // return 'Date'
    case 'image':
      return 'Image'
    case 'markdown':
      return 'Markdown'
    case 'mdx':
      return 'MDX'
    case 'inline_object':
      return '{\n' + field.fieldDefs.map(renderFieldDef).join('\n') + '\n}'
    case 'object': {
      return field.objectName
    }
    case 'reference':
      return 'string'
    case 'polymorphic_list':
      const wrapInParenthesis = (_: string) => `(${_})`
      return wrapInParenthesis(field.of.map(renderListItemFieldType).join(' | ')) + '[]'
    case 'list':
      return renderListItemFieldType(field.of) + '[]'
    case 'enum':
      return field.options.map((_) => `'${_}'`).join(' | ')
    default:
      return `'todo ${field.type}'`
  }
}

const renderListItemFieldType = (item: ListFieldDefItem): string => {
  switch (item.type) {
    case 'boolean':
    case 'string':
      return item.type
    case 'object':
      return item.objectName
    case 'enum':
      return '(' + item.options.map((_) => `'${_}'`).join(' | ') + ')'
    case 'inline_object':
      return '{\n' + item.fieldDefs.map(renderFieldDef).join('\n') + '\n}'
    case 'reference':
      // We're just returning the id (e.g. file path or record id) to the referenced document here
      return 'string'
  }
}
