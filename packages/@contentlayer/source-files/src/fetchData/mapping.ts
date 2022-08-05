import type { HasCwd, UnexpectedMarkdownError, UnexpectedMDXError } from '@contentlayer/core'
import * as core from '@contentlayer/core'
import type { AbsolutePosixFilePath, RelativePosixFilePath } from '@contentlayer/utils'
import * as utils from '@contentlayer/utils'
import type { HasConsole, OT } from '@contentlayer/utils/effect'
import { identity, pipe, T } from '@contentlayer/utils/effect'
// Use legacy import format since somehow ESM export isn't properly picked up for `date-fns-tz`
import dateFnsTz from 'date-fns-tz'

import { FetchDataError } from '../errors/index.js'
import type { HasDocumentContext } from './DocumentContext.js'
import { getFromDocumentContext } from './DocumentContext.js'
import { getImageFieldData } from './image/index.js'
import type { RawContent, RawContentMarkdown, RawContentMDX } from './types.js'

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
  OT.HasTracer & HasConsole & HasDocumentContext & HasCwd,
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
              typeName: documentTypeDef.name,
              coreSchemaDef,
              options,
              relativeFilePath,
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
  | UnexpectedMarkdownError
  | UnexpectedMDXError
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
  relativeFilePath,
  contentDirPath,
}: {
  rawObjectData: Record<string, any>
  /** Passing `FieldDef[]` here instead of `ObjectDef` in order to also support `inline_nested` */
  fieldDefs: core.FieldDef[]
  typeName: string
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
  relativeFilePath: RelativePosixFilePath
  contentDirPath: AbsolutePosixFilePath
}): T.Effect<OT.HasTracer & HasConsole & HasDocumentContext & HasCwd, MakeDocumentInternalError, core.NestedDocument> =>
  T.gen(function* ($) {
    const objValues = yield* $(
      T.forEachParDict_(fieldDefs, {
        mapValue: (fieldDef) =>
          getDataForFieldDef({
            fieldDef,
            rawFieldData: rawObjectData[fieldDef.name],
            typeName,
            coreSchemaDef,
            options,
            relativeFilePath,
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
  typeName,
  coreSchemaDef,
  options,
  relativeFilePath,
  contentDirPath,
}: {
  fieldDef: core.FieldDef
  rawFieldData: any
  typeName: string
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
  relativeFilePath: RelativePosixFilePath
  contentDirPath: AbsolutePosixFilePath
}): T.Effect<OT.HasTracer & HasConsole & HasDocumentContext & HasCwd, MakeDocumentInternalError, any> =>
  T.gen(function* ($) {
    if (rawFieldData === undefined && fieldDef.default) {
      rawFieldData = fieldDef.default
    }

    if (rawFieldData === undefined) {
      if (fieldDef.isRequired && !fieldDef.isSystemField) {
        console.error(`Inconsistent data found: ${JSON.stringify(fieldDef)}`)
      }

      return undefined
    }

    switch (fieldDef.type) {
      case 'nested': {
        const nestedTypeDef = coreSchemaDef.nestedTypeDefMap[fieldDef.nestedTypeName]!
        return yield* $(
          makeNestedDocument({
            rawObjectData: rawFieldData,
            fieldDefs: nestedTypeDef.fieldDefs,
            typeName: nestedTypeDef.name,
            coreSchemaDef,
            options,
            relativeFilePath,
            contentDirPath,
          }),
        )
      }
      case 'nested_unnamed':
        return yield* $(
          makeNestedDocument({
            rawObjectData: rawFieldData,
            fieldDefs: fieldDef.typeDef.fieldDefs,
            typeName: '__UNNAMED__',
            coreSchemaDef,
            options,
            relativeFilePath,
            contentDirPath,
          }),
        )
      case 'nested_polymorphic': {
        const typeName = rawFieldData[fieldDef.typeField]

        if (!fieldDef.nestedTypeNames.includes(typeName)) {
          return yield* $(
            T.fail(
              new FetchDataError.NoSuchNestedDocumentTypeError({
                documentTypeName: typeName,
                documentFilePath: relativeFilePath,
                fieldName: fieldDef.name,
                validNestedTypeNames: fieldDef.nestedTypeNames,
              }),
            ),
          )
        }

        const nestedTypeDef = coreSchemaDef.nestedTypeDefMap[typeName]!

        return yield* $(
          makeNestedDocument({
            rawObjectData: rawFieldData,
            fieldDefs: nestedTypeDef.fieldDefs,
            typeName: nestedTypeDef.name,
            coreSchemaDef,
            options,
            relativeFilePath,
            contentDirPath,
          }),
        )
      }
      case 'reference':
      case 'reference_polymorphic':
        return rawFieldData
      case 'list_polymorphic':
      case 'list':
        return yield* $(
          T.forEachPar_(rawFieldData as any[], (rawItemData) =>
            getDataForListItem({ rawItemData, fieldDef, coreSchemaDef, options, relativeFilePath, contentDirPath }),
          ),
        )
      case 'date':
        const value = yield* $(
          T.tryCatch(
            () => {
              let dateValue = new Date(rawFieldData)
              if (options.date?.timezone) {
                // NOTE offset of specified timezone in milliseconds
                const desiredOffsetMs = dateFnsTz.getTimezoneOffset(options.date.timezone)

                // NOTE offset of raw date value is in minutes, we must multiple 60 then 1000 to get milliseconds
                const currentOffsetMs = dateValue.getTimezoneOffset() * 60 * 1000

                if (desiredOffsetMs != currentOffsetMs) {
                  dateValue = new Date(dateValue.getTime() + dateFnsTz.getTimezoneOffset(options.date.timezone) * -1)
                }
              }
              return dateValue.toISOString()
            },
            () =>
              new FetchDataError.IncompatibleFieldDataError({
                documentFilePath: relativeFilePath,
                documentTypeName: typeName,
                incompatibleFieldData: [[fieldDef.name, rawFieldData]],
              }),
          ),
        )

        return value
      case 'markdown': {
        const isBodyField = fieldDef.name === options.fieldOptions.bodyFieldName
        const rawDocumentData = yield* $(getFromDocumentContext('rawDocumentData'))
        // NOTE for the body field, we're passing the entire document file contents to MDX (e.g. in case some remark/rehype plugins need access to the frontmatter)
        // TODO we should come up with a better way to do this
        if (isBodyField) {
          const rawContent = yield* $(getFromDocumentContext('rawContent'))
          if (rawContent.kind !== 'markdown' && rawContent.kind !== 'mdx') return utils.assertNever(rawContent)

          const html = yield* $(
            core.markdownToHtml({
              mdString: rawContent.rawDocumentContent,
              options: options?.markdown,
              rawDocumentData,
            }),
          )
          return identity<core.Markdown>({ raw: rawFieldData, html })
        } else {
          const html = yield* $(
            core.markdownToHtml({ mdString: rawFieldData, options: options?.markdown, rawDocumentData }),
          )
          return identity<core.Markdown>({ raw: rawFieldData, html })
        }
      }
      case 'mdx': {
        const isBodyField = fieldDef.name === options.fieldOptions.bodyFieldName
        const rawDocumentData = yield* $(getFromDocumentContext('rawDocumentData'))
        // NOTE for the body field, we're passing the entire document file contents to MDX (e.g. in case some remark/rehype plugins need access to the frontmatter)
        // TODO we should come up with a better way to do this
        if (isBodyField) {
          const rawContent = yield* $(getFromDocumentContext('rawContent'))
          if (rawContent.kind !== 'mdx' && rawContent.kind !== 'markdown') return utils.assertNever(rawContent)

          const code = yield* $(
            core.bundleMDX({
              mdxString: rawContent.rawDocumentContent,
              options: options?.mdx,
              contentDirPath,
              rawDocumentData,
            }),
          )
          return identity<core.MDX>({ raw: rawFieldData, code })
        } else {
          const code = yield* $(
            core.bundleMDX({ mdxString: rawFieldData, options: options?.mdx, contentDirPath, rawDocumentData }),
          )
          return identity<core.MDX>({ raw: rawFieldData, code })
        }
      }
      case 'image':
        if (typeof rawFieldData !== 'string') {
          yield* $(
            T.fail(
              new FetchDataError.IncompatibleFieldDataError({
                documentTypeName: typeName,
                documentFilePath: relativeFilePath,
                incompatibleFieldData: [[fieldDef.name, rawFieldData]],
              }),
            ),
          )
        }

        return yield* $(
          getImageFieldData({ imagePath: rawFieldData, documentFilePath: relativeFilePath, contentDirPath, fieldDef }),
        )
      case 'boolean':
      case 'string':
      case 'number':
      case 'json':
      // case 'slug':
      // case 'text':
      // case 'url':
      case 'enum':
        // case 'image':
        return rawFieldData
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
  relativeFilePath,
  contentDirPath,
}: {
  rawItemData: any
  fieldDef: core.ListFieldDef | core.ListPolymorphicFieldDef
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
  relativeFilePath: RelativePosixFilePath
  contentDirPath: AbsolutePosixFilePath
}): T.Effect<OT.HasTracer & HasConsole & HasDocumentContext & HasCwd, MakeDocumentInternalError, any> => {
  if (typeof rawItemData === 'string') {
    return T.succeed(rawItemData)
  }

  if (fieldDef.type === 'list_polymorphic') {
    const nestedTypeName = rawItemData[fieldDef.typeField]
    const nestedTypeDef = coreSchemaDef.nestedTypeDefMap[nestedTypeName]
    if (nestedTypeDef === undefined) {
      const validNestedTypeNames = fieldDef.of
        .filter((_): _ is core.ListFieldDefItem.ItemNested => _.type === 'nested')
        .map((_) => _.nestedTypeName)

      return T.fail(
        new FetchDataError.NoSuchNestedDocumentTypeError({
          documentTypeName: nestedTypeName,
          documentFilePath: relativeFilePath,
          fieldName: fieldDef.name,
          validNestedTypeNames,
        }),
      )
    }
    return makeNestedDocument({
      rawObjectData: rawItemData,
      fieldDefs: nestedTypeDef.fieldDefs,
      typeName: nestedTypeDef.name,
      coreSchemaDef,
      options,
      relativeFilePath,
      contentDirPath,
    })
  }

  switch (fieldDef.of.type) {
    case 'nested':
      const nestedTypeDef = coreSchemaDef.nestedTypeDefMap[fieldDef.of.nestedTypeName]!
      return makeNestedDocument({
        rawObjectData: rawItemData,
        fieldDefs: nestedTypeDef.fieldDefs,
        typeName: nestedTypeDef.name,
        coreSchemaDef,
        options,
        relativeFilePath,
        contentDirPath,
      })
    case 'nested_unnamed':
      return makeNestedDocument({
        rawObjectData: rawItemData,
        fieldDefs: fieldDef.of.typeDef.fieldDefs,
        typeName: '__UNNAMED__',
        coreSchemaDef,
        options,
        relativeFilePath,
        contentDirPath,
      })
    case 'boolean':
    case 'enum':
    case 'reference':
    case 'string':
      return T.succeed(rawItemData)
    default:
      return utils.casesHandled(fieldDef.of)
  }
}
