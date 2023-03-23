import type * as core from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect'

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
          (error) => new Error('TODO: Make error'),
        ),
    }),
    OT.withSpan('@contentlayer/source-notion/fetchData:getComputedValues'),
  )
