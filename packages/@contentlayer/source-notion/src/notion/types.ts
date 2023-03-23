import type { DatabaseObjectResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

import type { DiscriminateUnion, DiscriminateUnionValue } from '../types'

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
