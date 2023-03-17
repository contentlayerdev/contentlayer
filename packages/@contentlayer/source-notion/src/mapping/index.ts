import type * as core from '@contentlayer/core'
import type { NotionRenderer } from '@notion-render/client';

import type { DatabaseFieldTypeDef, DatabaseTypeDef } from '../schema/types.js';
import type { DatabaseProperty, DatabasePropertyTypes, DistributiveOmit, PageProperty, PagePropertyTypes } from "../types.js";
import { fieldCheckbox } from './field-checkbox.js';
import { fieldCreatedBy } from './field-created-by.js';
import { fieldCreatedTime } from './field-created-time.js';
import { fieldDate } from './field-date.js';
import { fieldEmail } from './field-email.js';
import { fieldFields } from './field-files.js';
import { fieldFormula } from './field-formula.js';
import { fieldLastEditedBy } from './field-last-edited-by.js';
import { fieldLastEditedTime } from './field-last-edited-time.js';
import { fieldNumber } from './field-number.js';
import { fieldPeople } from './field-people.js';
import { fieldPhoneNumber } from './field-phone-number.js';
import { fieldRelation } from './field-relation.js';
import { fieldRichText } from './field-rich-text.js';
import { fieldRollup } from './field-rollup.js';
import { fieldSelect } from './field-select.js';
import { fieldStatus } from './field-status.js';
import { fieldTitle } from './field-title.js';
import { fieldUrl } from './field-url.js';

export type GetFieldDataFunction<T extends PagePropertyTypes> = (params: {
    fieldDef: core.FieldDef,
    databaseFieldTypeDef: DatabaseFieldTypeDef | undefined,
    databaseTypeDef: DatabaseTypeDef
    options: core.PluginOptions,
    property: PageProperty<T>,
    renderer: NotionRenderer
}) => any;

export type GetFieldDefFunction<T extends DatabasePropertyTypes = DatabasePropertyTypes> = (params: {
    options: core.PluginOptions,
    property: DatabaseProperty<T>,
    databaseFieldTypeDef: DatabaseFieldTypeDef | undefined,
    databaseTypeDef: DatabaseTypeDef,
    documentTypeDefMap: core.DocumentTypeDefMap
}) => DistributiveOmit<core.FieldDef, 'name' | 'isSystemField' | 'default' | 'description' | 'isRequired'>;

export type FieldFunctions<T extends DatabasePropertyTypes = DatabasePropertyTypes> = {
    getFieldDef: GetFieldDefFunction<T>,
    getFieldData: GetFieldDataFunction<T>,
}

type FieldMappingType = {
    // TODO : Remove optional
    [key in DatabasePropertyTypes]?: FieldFunctions<key>
}

const FieldMapping: FieldMappingType = {
    'checkbox': fieldCheckbox,
    'email': fieldEmail,
    'phone_number': fieldPhoneNumber,
    'select': fieldSelect,
    'url': fieldUrl,
    'number': fieldNumber,
    'title': fieldTitle,
    'created_time': fieldCreatedTime,
    'status': fieldStatus,
    'date': fieldDate,
    'last_edited_time': fieldLastEditedTime,
    'rich_text': fieldRichText,
    'files': fieldFields,
    'people': fieldPeople,
    'last_edited_by': fieldLastEditedBy,
    'created_by': fieldCreatedBy,
    'formula': fieldFormula,
    'relation': fieldRelation,
    'rollup': fieldRollup,
}

export const getFieldFunctions = <
    T extends DatabasePropertyTypes = DatabasePropertyTypes
>(type: DatabasePropertyTypes): FieldFunctions<T> | undefined => {
    const func = FieldMapping[type] as FieldFunctions<T> | undefined;

    if (!func) {
        console.warn(`Field type ${type} is not yet implemented`)
    }

    return func;
} 