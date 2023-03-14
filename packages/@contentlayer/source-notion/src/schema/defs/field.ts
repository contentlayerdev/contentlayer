import type * as core from '@contentlayer/core'

import { getFieldFunctions } from '../../mapping/index.js';
import type { DatabaseProperty, DatabasePropertyTypes, FieldDef } from '../../types.js'

export const toFieldDef = <T extends DatabasePropertyTypes>({
    property,
    key,
    options
}: {
    property: DatabaseProperty<T>,
    key: string,
    options: core.PluginOptions
}): FieldDef | undefined => {
    const functions = getFieldFunctions(property.type);
    if (!functions) return;

    const def = functions.getFieldDef({ property, options })

    return {
        name: `"${key}"`, // TODO : Transform property name to match [A-Za-z0-9_]
        path: key,
        isSystemField: false,
        description: undefined,
        ...def,
    } as FieldDef // TODO : Fix typing problems with ReferencePolymorphicFieldDef 
}