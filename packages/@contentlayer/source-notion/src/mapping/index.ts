import type * as core from '@contentlayer/core'

import type { DatabaseProperty, DatabasePropertyTypes, DistributiveOmit, PageProperty, PagePropertyTypes } from "../types.js";
import { fieldCheckbox } from './field-checkbox.js';
import { fieldCreatedTime } from './field-created-time.js';
import { fieldDate } from './field-date.js';
import { fieldEmail } from './field-email.js';
import { fieldLastEditedTime } from './field-last-edited-time.js';
import { fieldNumber } from './field-number.js';
import { fieldPhoneNumber } from './field-phone-number.js';
import { fieldSelect } from './field-select.js';
import { fieldStatus } from './field-status.js';
import { fieldTitle } from './field-title.js';
import { fieldUrl } from './field-url.js';

type GetFieldDataFunction<T extends PagePropertyTypes> = (params: {
    fieldDef: core.FieldDef,
    options: core.PluginOptions,
    property: PageProperty<T>
}) => any;

type GetFieldDefFunction<T extends DatabasePropertyTypes = DatabasePropertyTypes> = (params: {
    options: core.PluginOptions,
    property: DatabaseProperty<T>
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
    'last_edited_time': fieldLastEditedTime
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