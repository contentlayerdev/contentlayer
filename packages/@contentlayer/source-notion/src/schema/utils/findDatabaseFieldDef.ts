import type { DatabaseFieldTypeDef, DatabaseTypeDef } from '../types'

export type FindDatabaseFieldDefArgs = {
  property: { id: string; name: string }
  databaseTypeDef: DatabaseTypeDef
}

export const findDatabaseFieldDef = ({
  databaseTypeDef,
  property,
}: FindDatabaseFieldDefArgs): DatabaseFieldTypeDef | undefined => {
  if (!databaseTypeDef.fields) return

  return databaseTypeDef.fields.find((fieldDef) => {
    if ('name' in fieldDef) return fieldDef.name === property.name
    if ('id' in fieldDef) return fieldDef.id === property.id
  })
}
