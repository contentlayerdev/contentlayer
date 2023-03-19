import type { Thunk } from '@contentlayer/utils'
import { T, tag } from '@contentlayer/utils/effect'
import type { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints'

export type DatabaseFieldTypeDefBase = {
  /**
   * Map this property to a specific key.
   * Defaults to the property name.
   */
  key?: string

  /**
   * Field description used to generate comments.
   */
  description?: string

  /**
   * When required, pages without this property defined will not be generated.
   */
  isRequired?: boolean
} & ({ id: string } | { name: string })

export type DatabaseRelationFieldTypeDef = DatabaseFieldTypeDefBase & {
  /**
   * Type of the property to configure it.
   */
  type: 'relation'

  /**
   * Database related to this relation.
   *
   * TODO : Will be used for Rollup properties.
   */
  relation?: DatabaseType

  /**
   * If true, the property will be of type `string` instead of type `string[]`
   * and only the first item will be taken.
   */
  single?: boolean
}

export type DatabaseFieldTypeDef = DatabaseFieldTypeDefBase | DatabaseRelationFieldTypeDef

export type DatabaseTypeDef<Flattened extends boolean = true, DefName extends string = string> = {
  /**
   * The database name.
   */
  name: DefName

  /**
   * The database description used to generate comments.
   */
  description?: string

  /**
   * The database ID used as the content source.
   */
  databaseId: string

  /**
   * By disabling automatic imports, properties must be defined in `fields` property to be present in generated content.
   * Useful when you have page properties containing sensitive data.
   */
  automaticImport?: boolean

  /**
   * By disabling content import, the page content will not be fetched.
   * Useful when you only want to use page properties for this database.
   */
  importContent?: boolean

  /**
   * Sort and filter pages queried from the database.
   * More information on the Notion API documentation https://developers.notion.com/reference/post-database-query-filter
   */
  query?: Omit<QueryDatabaseParameters, 'database_id' | 'filter_properties' | 'start_cursor' | 'page_size'>

  /**
   * The fields configuration, usefull to remap keys and configure complex properties.
   * Not required as the properties types are already inferred.
   */
  fields?: Flattened extends false
    ? Record<string, DatabaseFieldTypeDef> | DatabaseFieldTypeDef[]
    : DatabaseFieldTypeDef[]
}

export type DatabaseType<DefName extends string = string> = {
  type: 'database'
  def: Thunk<DatabaseTypeDef<false, DefName>>
}

export type DatabaseTypes = DatabaseType<any>[] | Record<string, DatabaseType<any>>

export const defineDatabase = <DefName extends string>(
  def: Thunk<DatabaseTypeDef<false, DefName>>,
): DatabaseType<DefName> => ({
  type: 'database',
  def,
})
