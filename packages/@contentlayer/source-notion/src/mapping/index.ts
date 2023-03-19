import type * as core from '@contentlayer/core'
import type { Has } from '@contentlayer/utils/effect'
import { pipe, T } from '@contentlayer/utils/effect'
import type { NotionRenderer } from '@notion-render/client'
import type * as notion from '@notionhq/client'

import type { DatabaseFieldTypeDef, DatabaseTypeDef } from '../schema/types.js'
import type {
  DatabaseProperty,
  DatabasePropertyTypes,
  DistributiveOmit,
  FieldDef,
  PageProperty,
  PagePropertyTypes,
} from '../types.js'
import { fieldCheckbox } from './field-checkbox.js'
import { fieldCreatedBy } from './field-created-by.js'
import { fieldCreatedTime } from './field-created-time.js'
import { fieldDate } from './field-date.js'
import { fieldEmail } from './field-email.js'
import { fieldFiles } from './field-files.js'
import { fieldFormula } from './field-formula.js'
import { fieldLastEditedBy } from './field-last-edited-by.js'
import { fieldLastEditedTime } from './field-last-edited-time.js'
import { fieldNumber } from './field-number.js'
import { fieldPeople } from './field-people.js'
import { fieldPhoneNumber } from './field-phone-number.js'
import { fieldRelation } from './field-relation.js'
import { fieldRichText } from './field-rich-text.js'
import { fieldSelect } from './field-select.js'
import { fieldStatus } from './field-status.js'
import { fieldTitle } from './field-title.js'
import { fieldUrl } from './field-url.js'

export type GetFieldDefArgs<T extends DatabasePropertyTypes> = {
  property: DatabaseProperty<T>
  databaseFieldTypeDef: DatabaseFieldTypeDef | undefined
  databaseTypeDef: DatabaseTypeDef
}

export type GetFieldDef<T extends DatabasePropertyTypes> = (
  args: GetFieldDefArgs<T>,
) => T.Effect<
  Has<notion.Client> & Has<NotionRenderer>,
  unknown,
  DistributiveOmit<core.FieldDef, 'name' | 'isSystemField' | 'default' | 'description' | 'isRequired'>
>

export type GetFieldDataArgs<T extends PagePropertyTypes> = {
  property: PageProperty<T>
  databaseFieldTypeDef: DatabaseFieldTypeDef | undefined
  databaseTypeDef: DatabaseTypeDef
  fieldDef: FieldDef
  documentTypeDef: core.DocumentTypeDef
}

export type GetFieldData<T extends DatabasePropertyTypes> = (
  args: GetFieldDataArgs<T>,
) => T.Effect<Has<notion.Client> & Has<NotionRenderer>, unknown, any>

export type FieldFunctions<T extends DatabasePropertyTypes = DatabasePropertyTypes> = {
  getFieldDef: GetFieldDef<T>
  getFieldData: GetFieldData<T>
}

type FieldMappingType = {
  // TODO : Remove optional
  [key in DatabasePropertyTypes]?: FieldFunctions<key>
}

const FieldMapping: FieldMappingType = {
  checkbox: fieldCheckbox,
  email: fieldEmail,
  phone_number: fieldPhoneNumber,
  select: fieldSelect,
  url: fieldUrl,
  number: fieldNumber,
  title: fieldTitle,
  created_time: fieldCreatedTime,
  status: fieldStatus,
  date: fieldDate,
  last_edited_time: fieldLastEditedTime,
  rich_text: fieldRichText,
  files: fieldFiles,
  people: fieldPeople,
  last_edited_by: fieldLastEditedBy,
  created_by: fieldCreatedBy,
  formula: fieldFormula,
  relation: fieldRelation,
}

export const getFieldFunctions = <T extends DatabasePropertyTypes = DatabasePropertyTypes>(
  type: DatabasePropertyTypes,
) =>
  pipe(
    T.sync(() => FieldMapping[type] as FieldFunctions<T> | undefined),

    T.chain((func) =>
      T.cond_(
        !!func,
        () => func!,
        () => 'fail' as const, // TODO : Error
      ),
    ),
  )
