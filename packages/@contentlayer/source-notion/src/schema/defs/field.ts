import type * as core from '@contentlayer/core'
import slugify from 'slugify';

import { getFieldFunctions } from '../../mapping/index.js';
import type { DatabaseProperty, DatabasePropertyTypes, FieldDef } from '../../types.js'
import type { DatabaseFieldTypeDef } from './index.js';

const normalizeKey = (key: string) => {
    const slugified = slugify(key);
    return slugified.toLowerCase().replace(/([-_][a-z])/g, group =>
        group
            .toUpperCase()
            .replace('-', '')
            .replace('_', '')
    );
}

export const toFieldDef = <T extends DatabasePropertyTypes>({
    property,
    key,
    options,
    databaseFieldDef,
}: {
    property: DatabaseProperty<T>,
    key: string,
    databaseFieldDef?: DatabaseFieldTypeDef,
    options: core.PluginOptions
}): FieldDef | undefined => {
    const functions = getFieldFunctions(property.type);
    if (!functions) return;

    const def = functions.getFieldDef({ property, options })
    const name = normalizeKey(key);

    console.log(name);

    return {
        name, // TODO : Transform property name to match [A-Za-z0-9_]
        propertyKey: property.name,
        isSystemField: false,
        description: undefined,
        isRequired: databaseFieldDef?.isRequired ?? false,
        ...def,
    } as FieldDef // TODO : Fix typing problems with ReferencePolymorphicFieldDef 
}
