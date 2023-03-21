import type * as core from '@contentlayer/core'
import type { NotionRenderer } from '@notion-render/client'
import type * as notion from '@notionhq/client'
import type { DatabaseObjectResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

import type { DatabaseTypes } from './schema/types.js'

export type PluginOptions = {
  client?: notion.Client
  renderer?: NotionRenderer
  databaseTypes: DatabaseTypes
}

export type FieldDef = core.FieldDef & { propertyKey: string }

export type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never

export type DiscriminateUnionValue<T, K extends keyof T, V extends T[K]> = T extends Record<K, V>
  ? V extends string
    ? T extends Record<V, any>
      ? T[V]
      : never
    : never
  : never

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

export type DatabaseProperties = DatabaseObjectResponse['properties'][number]
export type DatabasePropertyTypes = DatabaseProperties['type']
export type DatabaseProperty<T extends DatabasePropertyTypes> = DiscriminateUnion<DatabaseProperties, 'type', T>
export type DatabasePropertyData<T extends DatabasePropertyTypes> = DiscriminateUnionValue<
  DatabaseProperties,
  'type',
  T
>

export type PageProperties = PageObjectResponse['properties'][number]
export type PagePropertyTypes = PageProperties['type']
export type PageProperty<T extends PagePropertyTypes> = DiscriminateUnion<PageProperties, 'type', T>
export type PagePropertyData<T extends PagePropertyTypes> = DiscriminateUnionValue<PageProperties, 'type', T>
