import type { DatabaseTypeDef } from '../types'

export const flattendDatabaseTypeDef = (databaseTypeDef: DatabaseTypeDef<false>): DatabaseTypeDef<true> => {
  return {
    ...databaseTypeDef,
    fields: databaseTypeDef.fields
      ? Array.isArray(databaseTypeDef.fields)
        ? databaseTypeDef.fields
        : Object.entries(databaseTypeDef.fields).map(([key, field]) => ({
            key,
            ...field,
          }))
      : [],
  }
}
