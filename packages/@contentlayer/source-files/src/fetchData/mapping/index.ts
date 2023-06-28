import type * as core from '@contentlayer/core'
import type { AbsolutePosixFilePath, fs, RelativePosixFilePath } from '@contentlayer/utils'
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
  OT.HasTracer & HasConsole & HasDocumentContext & core.HasCwd & fs.HasFs,
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
              isRootDocument: true,
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
    // deal with root `index` file
    .replace(/^index$/, '')
    // remove tailing `/index`
    .replace(/\/index$/, '')

// TODO aggregate all "global" params into an effect service
const makeNestedDocument = ({
  rawObjectData,
  fieldDefs,
  nestedTypeName,
  coreSchemaDef,
  options,
  documentFilePath,
  contentDirPath,
}: {
  rawObjectData: Record<string, any>
  /** Passing `FieldDef[]` here instead of `ObjectDef` in order to also support `inline_nested` */
  fieldDefs: core.FieldDef[]
  nestedTypeName: string
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
  documentFilePath: RelativePosixFilePath
  contentDirPath: AbsolutePosixFilePath
}): T.Effect<
  OT.HasTracer & HasConsole & HasDocumentContext & core.HasCwd & fs.HasFs,
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
            isRootDocument: false,
            coreSchemaDef,
            options,
            documentFilePath,
            contentDirPath,
          }),
        mapKey: (fieldDef) => T.succeed(fieldDef.name),
      }),
    )

    const typeNameField = options.fieldOptions.typeFieldName
    const obj: core.NestedDocument = { ...objValues, [typeNameField]: nestedTypeName, _raw: {} }

    return obj
  })

const getDataForFieldDef = ({
  fieldDef,
  rawFieldData,
  isRootDocument,
  coreSchemaDef,
  options,
  documentFilePath,
  contentDirPath,
}: {
  fieldDef: core.FieldDef
  rawFieldData: any
  isRootDocument: boolean
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
  documentFilePath: RelativePosixFilePath
  contentDirPath: AbsolutePosixFilePath
}): T.Effect<OT.HasTracer & HasConsole & HasDocumentContext & core.HasCwd & fs.HasFs, MakeDocumentInternalError, any> =>
  T.gen(function* ($) {
    if ((rawFieldData === undefined || rawFieldData === null) && fieldDef.default !== undefined) {
      rawFieldData = fieldDef.default
    }

    if (rawFieldData === undefined || rawFieldData === null) {
      const documentTypeDef = yield* $(getFromDocumentContext('documentTypeDef'))
      console.assert(
        fieldDef.isRequired === false || fieldDef.isSystemField === true,
        `Inconsistent data found: ${rawFieldData} ${JSON.stringify(
          {
            fieldDef,
            documentFilePath,
            rootDocTypeName: documentTypeDef.name,
            isRootDocument,
          },
          null,
          2,
        )}`,
      )

      return rawFieldData
    }

    const parseFieldDataEff = <TFieldType extends core.FieldDefType>(fieldType: TFieldType) =>
      parseFieldData({
        rawData: rawFieldData,
        fieldType,
        fieldName: fieldDef.name,
      })

    switch (fieldDef.type) {
      case 'nested': {
        const nestedTypeDef = coreSchemaDef.nestedTypeDefMap[fieldDef.nestedTypeName]!
        const rawObjectData = yield* $(parseFieldDataEff('nested'))
        return yield* $(
          makeNestedDocument({
            rawObjectData,
            fieldDefs: nestedTypeDef.fieldDefs,
            nestedTypeName: nestedTypeDef.name,
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
            nestedTypeName: '__UNNAMED__',
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
          const documentTypeDef = yield* $(getFromDocumentContext('documentTypeDef'))
          return yield* $(
            T.fail(
              new FetchDataError.NoSuchNestedDocumentTypeError({
                nestedTypeName,
                documentFilePath,
                fieldName: fieldDef.name,
                validNestedTypeNames: fieldDef.nestedTypeNames,
                documentTypeDef,
              }),
            ),
          )
        }

        const nestedTypeDef = coreSchemaDef.nestedTypeDefMap[nestedTypeName]!

        return yield* $(
          makeNestedDocument({
            rawObjectData,
            fieldDefs: nestedTypeDef.fieldDefs,
            nestedTypeName: nestedTypeDef.name,
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
              documentFilePath,
              contentDirPath,
            }),
          ),
        )
      case 'date':
        const dateString = yield* $(parseFieldDataEff('date'))
        return yield* $(makeDateField({ dateString, fieldName: fieldDef.name, options }))
      case 'markdown': {
        const mdString = yield* $(parseFieldDataEff('markdown'))
        const isDocumentBodyField = isRootDocument && fieldDef.name === options.fieldOptions.bodyFieldName
        return yield* $(makeMarkdownField({ mdString, options, isDocumentBodyField }))
      }
      case 'mdx': {
        const mdxString = yield* $(parseFieldDataEff('mdx'))
        const isDocumentBodyField = isRootDocument && fieldDef.name === options.fieldOptions.bodyFieldName
        return yield* $(makeMdxField({ mdxString, contentDirPath, options, isDocumentBodyField }))
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
  documentFilePath,
  contentDirPath,
}: {
  rawItemData: any
  fieldDef: core.ListFieldDef | core.ListPolymorphicFieldDef
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
  documentFilePath: RelativePosixFilePath
  contentDirPath: AbsolutePosixFilePath
}): T.Effect<OT.HasTracer & HasConsole & HasDocumentContext & core.HasCwd & fs.HasFs, MakeDocumentInternalError, any> =>
  T.gen(function* ($) {
    const parseFieldDataEff = <TFieldType extends core.FieldDefType>(fieldType: TFieldType) =>
      parseFieldData({
        rawData: rawItemData,
        fieldType,
        fieldName: fieldDef.name,
      })

    if (fieldDef.type === 'list_polymorphic') {
      const rawObjectData = yield* $(parseFieldDataEff('nested'))
      const nestedTypeName = rawObjectData[fieldDef.typeField]
      const nestedTypeDef = coreSchemaDef.nestedTypeDefMap[nestedTypeName]
      if (nestedTypeDef === undefined) {
        const validNestedTypeNames = fieldDef.of
          .filter((_): _ is core.ListFieldDefItem.ItemNested => _.type === 'nested')
          .map((_) => _.nestedTypeName)

        const documentTypeDef = yield* $(getFromDocumentContext('documentTypeDef'))
        return yield* $(
          T.fail(
            new FetchDataError.NoSuchNestedDocumentTypeError({
              nestedTypeName,
              documentFilePath,
              fieldName: fieldDef.name,
              validNestedTypeNames,
              documentTypeDef,
            }),
          ),
        )
      }
      return yield* $(
        makeNestedDocument({
          rawObjectData: rawItemData,
          fieldDefs: nestedTypeDef.fieldDefs,
          nestedTypeName: nestedTypeDef.name,
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
            nestedTypeName: nestedTypeDef.name,
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
            nestedTypeName: '__UNNAMED__',
            coreSchemaDef,
            options,
            documentFilePath,
            contentDirPath,
          }),
        )
      }
      case 'date':
        const dateString = yield* $(parseFieldDataEff('date'))
        return yield* $(makeDateField({ dateString, fieldName: fieldDef.name, options }))
      case 'markdown': {
        const mdString = yield* $(parseFieldDataEff('markdown'))
        return yield* $(makeMarkdownField({ mdString, options, isDocumentBodyField: false }))
      }
      case 'mdx': {
        const mdxString = yield* $(parseFieldDataEff('mdx'))
        return yield* $(makeMdxField({ mdxString, contentDirPath, options, isDocumentBodyField: false }))
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
