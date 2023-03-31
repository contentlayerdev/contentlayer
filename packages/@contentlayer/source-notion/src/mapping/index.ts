import type * as core from '@contentlayer/core'
import type { Has } from '@contentlayer/utils/effect'
import { T } from '@contentlayer/utils/effect'
import type { NotionRenderer } from '@notion-render/client'
import type * as notion from '@notionhq/client'

import type {
  DatabaseProperties,
  DatabasePropertyData,
  DatabasePropertyTypes,
  PageProperties,
  PagePropertyData,
  PagePropertyTypes,
} from '../notion/types.js'
import type { DatabaseTypeDef } from '../schema/types/database.js'
import type { DatabasePropertyTypeDef } from '../schema/types/property.js'
import { getDatabasePropertyData, getPagePropertyData } from '../schema/utils/getPropertyData.js'
import type { DistributiveOmit, FieldDef } from '../types.js'
import { fieldBool } from './field-bool.js'
import { fieldCreatedBy } from './field-created-by.js'
import { fieldDate } from './field-date.js'
import { fieldDateRange } from './field-date-range.js'
import { fieldFiles } from './field-files.js'
import { fieldFormula } from './field-formula.js'
import { fieldLastEditedBy } from './field-last-edited-by.js'
import { fieldMultiSelect } from './field-multi-select.js'
import { fieldNumber } from './field-number.js'
import { fieldPeople } from './field-people.js'
import { fieldRelation } from './field-relation.js'
import { fieldRichText } from './field-rich-text.js'
import { fieldRollup } from './field-rollup.js'
import { fieldSelect } from './field-select.js'
import { fieldStatus } from './field-status.js'
import { fieldString } from './field-string.js'

export type GetFieldDefArgs<T extends DatabasePropertyTypes> = {
  propertyData: DatabasePropertyData<T>
  databaseFieldTypeDef: DatabasePropertyTypeDef | undefined
  databaseTypeDef: DatabaseTypeDef
  getDocumentTypeDef: (databaseTypeDef: DatabaseTypeDef<false>) => T.Effect<unknown, never, core.DocumentTypeDef>
}

export type GetFieldDef<T extends DatabasePropertyTypes = DatabasePropertyTypes> = (
  args: GetFieldDefArgs<T>,
) => T.Effect<
  Has<notion.Client> & Has<NotionRenderer>,
  unknown,
  DistributiveOmit<core.FieldDef, 'name' | 'isSystemField' | 'default' | 'description' | 'isRequired'>
>

export type GetFieldDataArgs<T extends PagePropertyTypes> = {
  propertyData: PagePropertyData<T>
  databaseFieldTypeDef: DatabasePropertyTypeDef | undefined
  databaseTypeDef: DatabaseTypeDef
  fieldDef: FieldDef
  documentTypeDef: core.DocumentTypeDef
}

export type GetFieldData<T extends DatabasePropertyTypes = DatabasePropertyTypes> = (
  args: GetFieldDataArgs<T>,
) => T.Effect<Has<notion.Client> & Has<NotionRenderer>, unknown, any>

export type FieldFunctions<T extends DatabasePropertyTypes = DatabasePropertyTypes> = {
  getFieldDef: GetFieldDef<T>
  getFieldData: GetFieldData<T>
}

type FieldMappingType = {
  [key in DatabasePropertyTypes]: FieldFunctions
}

const FieldMapping: FieldMappingType = {
  checkbox: fieldBool,
  email: fieldString,
  phone_number: fieldString,
  select: fieldSelect,
  multi_select: fieldMultiSelect,
  url: fieldString,
  number: fieldNumber,
  title: fieldRichText,
  created_time: fieldDate,
  status: fieldStatus,
  date: fieldDateRange,
  last_edited_time: fieldDate,
  rich_text: fieldRichText,
  files: fieldFiles,
  people: fieldPeople,
  last_edited_by: fieldLastEditedBy,
  created_by: fieldCreatedBy,
  formula: fieldFormula,
  relation: fieldRelation,
  rollup: fieldRollup,
}

export const getFieldDef = <T extends DatabasePropertyTypes>(
  args: { property: DatabaseProperties } & Omit<GetFieldDefArgs<T>, 'propertyData'>,
) =>
  FieldMapping[args.property.type].getFieldDef({
    propertyData: getDatabasePropertyData(args.property),
    ...args,
  })

export const getFieldData = <T extends PagePropertyTypes>(
  args: { property: PageProperties } & Omit<GetFieldDataArgs<T>, 'propertyData'>,
) =>
  FieldMapping[args.property.type].getFieldData({
    propertyData: getPagePropertyData(args.property),
    ...args,
  })
