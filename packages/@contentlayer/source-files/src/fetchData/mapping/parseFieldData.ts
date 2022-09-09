import type * as core from '@contentlayer/core'
import type { RelativePosixFilePath } from '@contentlayer/utils'
import { T } from '@contentlayer/utils/effect'
import * as zod from 'zod'

import { FetchDataError } from '../../errors/index.js'

const ParsedImageData = zod.object({
  src: zod.string(),
  alt: zod.string().optional(),
})

const ImageData = zod.union([zod.string(), ParsedImageData]).transform((_) => {
  if (typeof _ === 'string') {
    return { src: _ }
  }
  return _
})

const codecMap = {
  boolean: zod.boolean(),
  number: zod.number(),
  string: zod.string(),
  date: zod.string(), // NOTE date parsing is handled in `field-date.ts`
  enum: zod.string(), // TODO
  image: ImageData,
  json: zod.any(),
  list: zod.array(zod.any()),
  list_polymorphic: zod.array(zod.any()),
  markdown: zod.string(),
  mdx: zod.string(),
  nested: zod.record(zod.any()),
  nested_polymorphic: zod.record(zod.any()),
  nested_unnamed: zod.record(zod.any()),
  reference: zod.string(),
  reference_polymorphic: zod.string(),
}

export type ParsedFieldData<TFieldType extends core.FieldDefType> = zod.infer<typeof codecMap[TFieldType]>

export const parseFieldData = <TFieldType extends core.FieldDefType>({
  rawData,
  fieldType,
  documentTypeDef,
  documentFilePath,
  fieldName,
}: {
  rawData: unknown
  fieldType: TFieldType
  documentTypeDef: core.DocumentTypeDef
  documentFilePath: RelativePosixFilePath
  fieldName: string
}): T.Effect<unknown, FetchDataError.IncompatibleFieldDataError, ParsedFieldData<TFieldType>> => {
  const result = codecMap[fieldType].safeParse(rawData)

  if (result.success) {
    return T.succeed(result.data)
  } else {
    return T.fail(
      new FetchDataError.IncompatibleFieldDataError({
        documentTypeDef,
        documentFilePath,
        incompatibleFieldData: [[fieldName, rawData]],
      }),
    )
  }
}
