import type * as core from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect'

import { ComputedValueError } from './errors.js'

export type GetComputedValuesArgs = {
  document: core.Document
  documentTypeDef: core.DocumentTypeDef
}

export const getComputedValues = ({ document, documentTypeDef }: GetComputedValuesArgs) =>
  pipe(
    T.forEachParDict_(documentTypeDef.computedFields ?? {}, {
      mapKey: (field) => T.succeed(field.name),
      mapValue: (field) =>
        T.tryCatchPromise(
          async () => field.resolve(document),
          (error) => new ComputedValueError({ error, documentTypeDef, document }),
        ),
    }),
    OT.withSpan('@contentlayer/source-notion/fetchData:getComputedValues'),
  )
