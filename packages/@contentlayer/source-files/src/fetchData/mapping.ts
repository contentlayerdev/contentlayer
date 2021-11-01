import type { UnexpectedMarkdownError, UnexpectedMDXError } from '@contentlayer/core'
import * as core from '@contentlayer/core'
import * as utils from '@contentlayer/utils'
import type { OT } from '@contentlayer/utils/effect'
import { pipe, T } from '@contentlayer/utils/effect'
import * as path from 'path'

import { FetchDataError } from '../errors/index.js'
import type { DocumentBodyType } from '../schema/defs/index.js'
import type { RawDocumentData } from '../types.js'
import type { RawContent, RawContentMarkdown, RawContentMDX } from './types.js'

export const makeDocument = ({
  rawContent,
  documentTypeDef,
  coreSchemaDef,
  relativeFilePath,
  options,
}: {
  rawContent: RawContent
  documentTypeDef: core.DocumentTypeDef
  coreSchemaDef: core.SchemaDef
  relativeFilePath: string
  options: core.PluginOptions
}): T.Effect<
  OT.HasTracer,
  FetchDataError.UnexpectedError | FetchDataError.NoSuchNestedDocumentTypeError,
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
              coreSchemaDef,
              options,
              relativeFilePath,
            }),
          mapKey: (fieldDef) => T.succeed(fieldDef.name),
        }),
      )

      const bodyType: DocumentBodyType = utils.pattern
        .match(rawContent.kind)
        .with('markdown', () => 'markdown' as const)
        .with('mdx', () => 'mdx' as const)
        .otherwise(() => 'none' as const)

      const _raw: RawDocumentData = {
        sourceFilePath: relativeFilePath,
        sourceFileName: path.basename(relativeFilePath),
        sourceFileDir: path.dirname(relativeFilePath),
        bodyType,
        flattenedPath: getFlattenedPath(relativeFilePath),
      }

      const doc: core.Document = {
        ...docValues,
        _id: relativeFilePath,
        _raw,
        [typeFieldName]: documentTypeDef.name,
      }

      return doc
    }),
    T.mapError((error) =>
      error._tag === 'NoSuchNestedDocumentTypeError'
        ? error
        : new FetchDataError.UnexpectedError({ error, documentFilePath: relativeFilePath }),
    ),
  )

type MakeDocumentInternalError =
  | UnexpectedMarkdownError
  | UnexpectedMDXError
  | FetchDataError.NoSuchNestedDocumentTypeError

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

const makeNestedDocument = ({
  rawObjectData,
  fieldDefs,
  typeName,
  coreSchemaDef,
  options,
  relativeFilePath,
}: {
  rawObjectData: Record<string, any>
  /** Passing `FieldDef[]` here instead of `ObjectDef` in order to also support `inline_nested` */
  fieldDefs: core.FieldDef[]
  typeName: string
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
  relativeFilePath: string
}): T.Effect<OT.HasTracer, MakeDocumentInternalError, core.NestedDocument> =>
  T.gen(function* ($) {
    const objValues = yield* $(
      T.forEachParDict_(fieldDefs, {
        mapValue: (fieldDef) =>
          getDataForFieldDef({
            fieldDef,
            rawFieldData: rawObjectData[fieldDef.name],
            coreSchemaDef,
            options,
            relativeFilePath,
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
  coreSchemaDef,
  options,
  relativeFilePath,
}: {
  fieldDef: core.FieldDef
  rawFieldData: any
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
  relativeFilePath: string
}): T.Effect<OT.HasTracer, MakeDocumentInternalError, any> =>
  T.gen(function* ($) {
    if (rawFieldData === undefined) {
      if (fieldDef.default !== undefined) {
        return fieldDef.default
      }

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
            getDataForListItem({ rawItemData, fieldDef, coreSchemaDef, options, relativeFilePath }),
          ),
        )
      case 'date':
        return new Date(rawFieldData)
      case 'markdown':
        const html = yield* $(core.markdownToHtml({ mdString: rawFieldData, options: options?.markdown }))
        return <core.Markdown>{ raw: rawFieldData, html }
      case 'mdx':
        const code = yield* $(core.bundleMDX({ mdxString: rawFieldData, options: options?.mdx }))
        return <core.MDX>{ raw: rawFieldData, code }
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

const getDataForListItem = ({
  rawItemData,
  fieldDef,
  coreSchemaDef,
  options,
  relativeFilePath,
}: {
  rawItemData: any
  fieldDef: core.ListFieldDef | core.ListPolymorphicFieldDef
  coreSchemaDef: core.SchemaDef
  options: core.PluginOptions
  relativeFilePath: string
}): T.Effect<OT.HasTracer, MakeDocumentInternalError, any> => {
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
      })
    case 'nested_unnamed':
      return makeNestedDocument({
        rawObjectData: rawItemData,
        fieldDefs: fieldDef.of.typeDef.fieldDefs,
        typeName: '__UNNAMED__',
        coreSchemaDef,
        options,
        relativeFilePath,
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
