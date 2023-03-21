import type { DatabasePropertyTypeDef, DatabaseTypeDef } from '../types'

export type FindDatabaseFieldDefArgs = {
  property: { id: string; name: string }
  databaseTypeDef: DatabaseTypeDef
}

export const findDatabaseFieldDef = ({
  databaseTypeDef,
  property,
}: FindDatabaseFieldDefArgs): DatabasePropertyTypeDef | undefined => {
  if (!databaseTypeDef.properties) return

  return databaseTypeDef.properties.find((fieldDef) => {
    if ('name' in fieldDef) return fieldDef.name === property.name
    if ('id' in fieldDef) return fieldDef.id === property.id
  })
}
