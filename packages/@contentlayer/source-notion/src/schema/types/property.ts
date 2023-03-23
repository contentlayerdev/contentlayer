import type { DatabaseType } from './database'

export type DatabasePropertyTypeDefBase = {
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
  required?: boolean
} & ({ id: string } | { name: string })

export type DatabasePropertyFieldTypeDef = DatabasePropertyTypeDefBase & {
  /**
   * Type of the property.
   */
  type: 'relation'

  /**
   * Database related to this relation.
   *
   * TODO : Will be used for Rollup properties.
   */
  relation: DatabaseType

  /**
   * If true, the property will be of type `string` instead of type `string[]`
   * and only the first item will be taken.
   */
  single?: boolean
}

export type DatabasePropertyTypeDef = DatabasePropertyTypeDefBase | DatabasePropertyFieldTypeDef
