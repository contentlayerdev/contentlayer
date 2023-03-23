import type { DatabaseTypeDef } from '../types/database'

export const flattendDatabaseTypeDef = (databaseTypeDef: DatabaseTypeDef<false>): DatabaseTypeDef<true> => {
  return {
    ...databaseTypeDef,
    properties: databaseTypeDef.properties
      ? Array.isArray(databaseTypeDef.properties)
        ? databaseTypeDef.properties
        : Object.entries(databaseTypeDef.properties).map(([key, field]) => ({
            key,
            ...field,
          }))
      : [],
  }
}
