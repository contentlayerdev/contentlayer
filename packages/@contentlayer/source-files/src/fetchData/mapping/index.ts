import type * as core from '@contentlayer/core'
import type { AbsolutePosixFilePath, RelativePosixFilePath } from '@contentlayer/utils'
import * as utils from '@contentlayer/utils'
import type { HasConsole, OT } from '@contentlayer/utils/effect'
import { identity, pipe, T } from '@contentlayer/utils/effect'

import { FetchDataError } from '../../errors/index.js'
import type { HasDocumentContext } from '../DocumentContext.js'
import { getFromDocumentContext } from '../DocumentContext.js'
import type { RawContent, RawContentMarkdown, RawContentMDX } from '../types.js'
import { makeDateField } from './field-date.js'
import { makeImageField } from './field-image.js'
import { makeMarkdownField } from './field-markdown.js'
import { makeMdxField } from './field-mdx.js'
import { parseFieldData } from './parseFieldData.js'

export const makeDocument = ({
  rawContent,
  documentTypeDef,
  coreSchemaDef,
  relativeFilePath,
  contentDirPath,
  options,
}: {
  rawContent: RawContent
  documentTypeDef: core.DocumentTypeDef
  coreSchemaDef: core.SchemaDef
  relativeFilePath: RelativePosixFilePath
  contentDirPath: AbsolutePosixFilePath
  options: core.PluginOptions
}): T.Effect<
  OT.HasTracer & HasConsole & HasDocumentContext & core.HasCwd,
  | FetchDataError.UnexpectedError
  | FetchDataError.ImageError
  | FetchDataError.IncompatibleFieldDataError
  | FetchDataError.NoSuchNestedDocumentTypeError,
  core.Document
> =>
  pipe(
    T.gen(function* ($) {
      const { bodyFieldName, typeFieldName } = options.fieldOptions
      // const includeBody = documentTypeDef.fieldDefs.some(
      //   (_) => _.name === bodyFieldName && _.isSystemField,
      // )
      const body = utils.pattern
        .match(rawContent)
        .when(rawContentHasBody, (_) => _.body)
        .otherwise(() => undefined)

      const rawData = { ...rawContent.fields, [bodyFieldName]: body }
      const docValues = yield* $(
        T.forEachParDict_(documentTypeDef.fieldDefs, {
          mapValue: (fieldDef) =>
            getDataForFieldDef({
              fieldDef,
              rawFieldData: rawData[fieldDef.name],
              documentTypeName: documentTypeDef.name,
              coreSchemaDef,
              options,
              documentFilePath: relativeFilePath,
              contentDirPath,
            }),
          mapKey: (fieldDef) => T.succeed(fieldDef.name),
        }),
      )

      const _raw = yield* $(getFromDocumentContext('rawDocumentData'))

      const doc = identity<core.Document>({
        ...docValues,
        _id: relativeFilePath,
        _raw,
        [typeFieldName]: documentTypeDef.name,
      })

      return doc
    }),
    T.mapError((error) =>
      error._tag === 'NoSuchNestedDocumentTypeError' ||
      error._tag === 'IncompatibleFieldDataError' ||
      error._tag === 'ImageError'
        ? error
        : new FetchDataError.UnexpectedError({ error, documentFilePath: relativeFilePath }),
    ),
  )

type MakeDocumentInternalError =
  | core.UnexpectedMarkdownError
  | core.UnexpectedMDXError
  | FetchDataError.NoSuchNestedDocumentTypeError
  | FetchDataError.IncompatibleFieldDataError
  | FetchDataError.ImageError

const rawContentHasBody = (_: RawContent): _ is RawContentMarkdown | RawContentMDX =>
  'body' in _ && _.body !== undefined

export const getFlattenedPath = (relativeFilePath: string): string =>
  relativeFilePath
    // remove extension
    .split('.')
    .slice(0, -1)
    .join('.')
    // remove tailing `/index` or `index`
    .replace(/\/?index$/, '')

// TODO aggregate all "global" params into an effect service
const makeNestedDocument = ({
  rawObjectData,
  fieldDefs,
  typeName,
  coreSchemaDef,
  options,
  documentFilePath,
  contentDirPath,
}: {
  rawObjectData: Record<string, any>
  /** Passing `FieldDef[]` here instead of `ObjectDef` in order to also support `inline_nested` */
  fieldDefs: core.FieldDef[]
  typeName: string
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
  documentFilePath: RelativePosixFilePath
  contentDirPath: AbsolutePosixFilePath
}): T.Effect<
  OT.HasTracer & HasConsole & HasDocumentContext & core.HasCwd,
  MakeDocumentInternalError,
  core.NestedDocument
> =>
  T.gen(function* ($) {
    const objValues = yield* $(
      T.forEachParDict_(fieldDefs, {
        mapValue: (fieldDef) =>
          getDataForFieldDef({
            fieldDef,
            rawFieldData: rawObjectData[fieldDef.name],
            documentTypeName: typeName,
            coreSchemaDef,
            options,
            documentFilePath,
            contentDirPath,
          }),
        mapKey: (fieldDef) => T.succeed(fieldDef.name),
      }),
    )

    const typeNameField = options.fieldOptions.typeFieldName
    const obj: core.NestedDocument = { ...objValues, [typeNameField]: typeName, _raw: {} }

    return obj
  })

const getDataForFieldDef = ({
  fieldDef,
  rawFieldData,
  documentTypeName,
  coreSchemaDef,
  options,
  documentFilePath,
  contentDirPath,
}: {
  fieldDef: core.FieldDef
  rawFieldData: any
  documentTypeName: string
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
  documentFilePath: RelativePosixFilePath
  contentDirPath: AbsolutePosixFilePath
}): T.Effect<OT.HasTracer & HasConsole & HasDocumentContext & core.HasCwd, MakeDocumentInternalError, any> =>
  T.gen(function* ($) {
    if (rawFieldData === undefined && fieldDef.default) {
      rawFieldData = fieldDef.default
    }

    if (rawFieldData === undefined) {
      console.assert(
        !fieldDef.isRequired || fieldDef.isSystemField,
        `Inconsistent data found: ${JSON.stringify({ fieldDef, documentFilePath, typeName: documentTypeName })}`,
      )

      return undefined
    }

    const documentTypeDef = coreSchemaDef.documentTypeDefMap[documentTypeName]!
    const parseFieldDataEff = <TFieldType extends core.FieldDefType>(fieldType: TFieldType) =>
      parseFieldData({
        rawData: rawFieldData,
        fieldType,
        documentFilePath,
        fieldName: fieldDef.name,
        documentTypeDef,
      })

    switch (fieldDef.type) {
      case 'nested': {
        const nestedTypeDef = coreSchemaDef.nestedTypeDefMap[fieldDef.nestedTypeName]!
        const rawObjectData = yield* $(parseFieldDataEff('nested'))
        return yield* $(
          makeNestedDocument({
            rawObjectData,
            fieldDefs: nestedTypeDef.fieldDefs,
            typeName: nestedTypeDef.name,
            coreSchemaDef,
            options,
            documentFilePath,
            contentDirPath,
          }),
        )
      }
      case 'nested_unnamed':
        const rawObjectData = yield* $(parseFieldDataEff('nested_unnamed'))
        return yield* $(
          makeNestedDocument({
            rawObjectData,
            fieldDefs: fieldDef.typeDef.fieldDefs,
            typeName: '__UNNAMED__',
            coreSchemaDef,
            options,
            documentFilePath,
            contentDirPath,
          }),
        )
      case 'nested_polymorphic': {
        const rawObjectData = yield* $(parseFieldDataEff('nested_polymorphic'))
        const nestedTypeName = rawObjectData[fieldDef.typeField]

        if (!fieldDef.nestedTypeNames.includes(nestedTypeName)) {
          return yield* $(
            T.fail(
              new FetchDataError.NoSuchNestedDocumentTypeError({
                nestedTypeName,
                documentFilePath,
                fieldName: fieldDef.name,
                validNestedTypeNames: fieldDef.nestedTypeNames,
                documentTypeDef: coreSchemaDef.documentTypeDefMap[documentTypeName]!,
              }),
            ),
          )
        }

        const nestedTypeDef = coreSchemaDef.nestedTypeDefMap[nestedTypeName]!

        return yield* $(
          makeNestedDocument({
            rawObjectData,
            fieldDefs: nestedTypeDef.fieldDefs,
            typeName: nestedTypeDef.name,
            coreSchemaDef,
            options,
            documentFilePath,
            contentDirPath,
          }),
        )
      }
      case 'reference':
      case 'reference_polymorphic':
        return yield* $(parseFieldDataEff(fieldDef.type))
      case 'list_polymorphic':
      case 'list':
        const rawListData = yield* $(parseFieldDataEff('list'))
        return yield* $(
          T.forEachPar_(rawListData, (rawItemData) =>
            getDataForListItem({
              rawItemData,
              fieldDef,
              coreSchemaDef,
              options,
              documentTypeName,
              documentFilePath,
              contentDirPath,
            }),
          ),
        )
      case 'date':
        const dateString = yield* $(parseFieldDataEff('date'))
        return yield* $(
          makeDateField({ dateString, documentFilePath, fieldName: fieldDef.name, documentTypeDef, options }),
        )
      case 'markdown': {
        const mdString = yield* $(parseFieldDataEff('markdown'))
        return yield* $(makeMarkdownField({ mdString, fieldDef, options }))
      }
      case 'mdx': {
        const mdxString = yield* $(parseFieldDataEff('mdx'))
        return yield* $(makeMdxField({ mdxString, contentDirPath, fieldDef, options }))
      }
      case 'image':
        const imageData = yield* $(parseFieldDataEff('image'))
        return yield* $(makeImageField({ imageData, documentFilePath, contentDirPath, fieldDef }))
      case 'boolean':
      case 'string':
      case 'number':
      case 'json':
      case 'enum': // TODO validate enum value
        return yield* $(parseFieldDataEff(fieldDef.type))
      default:
        utils.casesHandled(fieldDef)
    }
  })

export const testOnly_getDataForFieldDef = getDataForFieldDef

const getDataForListItem = ({
  rawItemData,
  fieldDef,
  coreSchemaDef,
  options,
  documentTypeName,
  documentFilePath,
  contentDirPath,
}: {
  rawItemData: any
  fieldDef: core.ListFieldDef | core.ListPolymorphicFieldDef
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
  documentTypeName: string
  documentFilePath: RelativePosixFilePath
  contentDirPath: AbsolutePosixFilePath
}): T.Effect<OT.HasTracer & HasConsole & HasDocumentContext & core.HasCwd, MakeDocumentInternalError, any> =>
  T.gen(function* ($) {
    const documentTypeDef = coreSchemaDef.documentTypeDefMap[documentTypeName]!
    const parseFieldDataEff = <TFieldType extends core.FieldDefType>(fieldType: TFieldType) =>
      parseFieldData({
        rawData: rawItemData,
        fieldType,
        documentFilePath,
        fieldName: fieldDef.name,
        documentTypeDef,
      })

    if (fieldDef.type === 'list_polymorphic') {
      const rawObjectData = yield* $(parseFieldDataEff('nested'))
      const nestedTypeName = rawObjectData[fieldDef.typeField]
      const nestedTypeDef = coreSchemaDef.nestedTypeDefMap[nestedTypeName]
      if (nestedTypeDef === undefined) {
        const validNestedTypeNames = fieldDef.of
          .filter((_): _ is core.ListFieldDefItem.ItemNested => _.type === 'nested')
          .map((_) => _.nestedTypeName)

        return yield* $(
          T.fail(
            new FetchDataError.NoSuchNestedDocumentTypeError({
              nestedTypeName,
              documentFilePath,
              fieldName: fieldDef.name,
              validNestedTypeNames,
              documentTypeDef: coreSchemaDef.documentTypeDefMap[documentTypeName]!,
            }),
          ),
        )
      }
      return yield* $(
        makeNestedDocument({
          rawObjectData: rawItemData,
          fieldDefs: nestedTypeDef.fieldDefs,
          typeName: nestedTypeDef.name,
          coreSchemaDef,
          options,
          documentFilePath,
          contentDirPath,
        }),
      )
    }

    switch (fieldDef.of.type) {
      case 'nested': {
        const nestedTypeDef = coreSchemaDef.nestedTypeDefMap[fieldDef.of.nestedTypeName]!
        const rawObjectData = yield* $(parseFieldDataEff('nested'))
        return yield* $(
          makeNestedDocument({
            rawObjectData,
            fieldDefs: nestedTypeDef.fieldDefs,
            typeName: nestedTypeDef.name,
            coreSchemaDef,
            options,
            documentFilePath,
            contentDirPath,
          }),
        )
      }
      case 'nested_unnamed': {
        const rawObjectData = yield* $(parseFieldDataEff('nested_unnamed'))
        return yield* $(
          makeNestedDocument({
            rawObjectData,
            fieldDefs: fieldDef.of.typeDef.fieldDefs,
            typeName: '__UNNAMED__',
            coreSchemaDef,
            options,
            documentFilePath,
            contentDirPath,
          }),
        )
      }
      case 'mdx':
        return makeMdxField({ mdxString: rawItemData, contentDirPath, fieldDef, options })
      case 'date':
        const dateString = yield* $(parseFieldDataEff('date'))
        return yield* $(
          makeDateField({ dateString, documentFilePath, fieldName: fieldDef.name, documentTypeDef, options }),
        )
      case 'markdown': {
        const mdString = yield* $(parseFieldDataEff('markdown'))
        return yield* $(makeMarkdownField({ mdString, fieldDef, options }))
      }
      case 'mdx': {
        const mdxString = yield* $(parseFieldDataEff('mdx'))
        return yield* $(makeMdxField({ mdxString, contentDirPath, fieldDef, options }))
      }
      case 'image':
        const imageData = yield* $(parseFieldDataEff('image'))
        return yield* $(makeImageField({ imageData, documentFilePath, contentDirPath, fieldDef }))
      case 'enum':
      case 'reference':
      case 'string':
      case 'boolean':
      case 'number':
      case 'json':
        return rawItemData
      default:
        return utils.casesHandled(fieldDef.of)
    }
  })
