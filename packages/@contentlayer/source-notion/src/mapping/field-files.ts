import { T } from '@contentlayer/utils/effect'

import type { FieldFunctions } from '.'

export const fieldFiles: FieldFunctions<'files'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'list',
      of: { type: 'string' },
      default: [],
    }),
  getFieldData: ({ propertyData }) =>
    T.succeed(propertyData.map((file) => ('file' in file ? file.file.url : file.external.url))),
}
