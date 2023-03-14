import type { FieldFunctions } from ".";

export const fieldFields: FieldFunctions<'files'> = {
    getFieldDef: () => {
        return {
            type: 'list',
            of: { type: 'string' }
        }
    },
    getFieldData: ({ property }) => {
        return property.files.map(file => 'file' in file ? file.file.url : file.external.url);
    }
}