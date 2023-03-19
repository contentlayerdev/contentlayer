import { pipe, T } from '@contentlayer/utils/effect'

import { NotionRenderer } from '../services.js'
import type { FieldFunctions } from '.'

export const fieldTitle: FieldFunctions<'title'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'string',
    }),
  getFieldData: ({ property }) =>
    pipe(
      T.service(NotionRenderer),
      T.chain((renderer) => T.tryPromise(() => renderer.render(...property.title))),
    ),
}
