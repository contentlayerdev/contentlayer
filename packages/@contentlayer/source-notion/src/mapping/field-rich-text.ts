import { pipe, T } from '@contentlayer/utils/effect'

import { NotionRenderer } from '../services.js'
import type { FieldFunctions } from '.'

export const fieldRichText: FieldFunctions<'rich_text' | 'title'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'string',
    }),
  getFieldData: ({ propertyData }) =>
    pipe(
      T.service(NotionRenderer),
      T.chain((renderer) => T.tryPromise(() => renderer.render(...propertyData))),
    ),
}
