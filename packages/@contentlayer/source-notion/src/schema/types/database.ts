import type { Thunk } from '@contentlayer/utils'
import type { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints'

import type { ComputedField } from './computed-field'
import type { DatabasePropertyTypeDef } from './property'

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
   */
  properties?: Flattened extends false
    ? Record<string, DatabasePropertyTypeDef> | DatabasePropertyTypeDef[]
    : DatabasePropertyTypeDef[]

  computedFields?: Record<string, ComputedField<DefName>>
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
