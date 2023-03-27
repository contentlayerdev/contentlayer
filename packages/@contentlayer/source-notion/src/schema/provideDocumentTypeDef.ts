import type * as core from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect'

import { NotionClient } from '../services.js'
import type { FieldDef } from '../types.js'
import { provideFieldDef } from './provideFieldDef.js'
import type { DatabaseTypeDef } from './types/database.js'

export type ProvideDocumentTypeDefArgs = {
  databaseTypeDef: DatabaseTypeDef
  getDocumentTypeDef: (databaseTypeDef: DatabaseTypeDef<false>) => T.Effect<unknown, never, core.DocumentTypeDef>
  options: core.PluginOptions
}

export const provideDocumentTypeDef = ({ databaseTypeDef, getDocumentTypeDef, options }: ProvideDocumentTypeDefArgs) =>
  pipe(
    T.service(NotionClient),
    T.chain((client) =>
      pipe(
        T.tryPromise(() => client.databases.retrieve({ database_id: databaseTypeDef.databaseId })),
        T.map(({ properties }) => Object.values(properties)),
        T.chain((properties) =>
          T.forEachPar_(properties, (property) => provideFieldDef({ databaseTypeDef, property, getDocumentTypeDef })),
        ),
      ),
    ),
    T.map((fieldDefsChunk) => {
      const fieldDefs = [...fieldDefsChunk].filter((fd) => fd) as FieldDef[]

      if (databaseTypeDef.importContent !== false) {
        fieldDefs.push({
          name: options.fieldOptions.bodyFieldName,
          type: 'nested',
          nestedTypeName: 'Body',
          description: 'The page content',
          isRequired: true,
          isSystemField: true,
          default: undefined,
        })
      }

      const computedFields = Object.entries(databaseTypeDef.computedFields ?? {}).map<core.ComputedField>(
        ([name, computedField]) => ({
          description: computedField.description,
          type: computedField.type,
          name,
          // NOTE we need to flip the variance here (casting a core.Document to a LocalDocument)
          resolve: computedField.resolve as core.ComputedFieldResolver,
        }),
      )

      return {
        _tag: 'DocumentTypeDef' as const,
        name: databaseTypeDef.name,
        description: databaseTypeDef.description,
        isSingleton: false,
        fieldDefs: fieldDefs,
        computedFields: computedFields,
        extensions: {},
      } as core.DocumentTypeDef
    }),

    OT.withSpan('@contentlayer/source-notion/schema:provideDocumentTypeDef'),
  )
