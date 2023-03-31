import type * as core from '@contentlayer/core'
import type { NotionRenderer } from '@notion-render/client'
import type * as notion from '@notionhq/client'

import type { DatabaseTypes } from './schema/types/database.js'

export type PluginOptions = {
  clientOptions?: ConstructorParameters<typeof notion.Client>[0]
  rendererOptions?: ConstructorParameters<typeof NotionRenderer>[0]
  databaseTypes: DatabaseTypes
}

export type FieldDef = core.FieldDef & { propertyKey?: string }

export type LocalDocument = Record<string, any> & { _raw: core.RawDocumentData; _id: string }

export type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never

export type DiscriminateUnionValue<T, K extends keyof T, V extends T[K]> = T extends Record<K, V>
  ? V extends string
    ? T extends Record<V, any>
      ? T[V]
      : never
    : never
  : never

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never
