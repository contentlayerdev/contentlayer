import type { HasCwd } from '@contentlayer/core'
import * as core from '@contentlayer/core'
import { provideCwd } from '@contentlayer/core'
import type { fs } from '@contentlayer/utils'
import { provideTracing, unknownToRelativePosixFilePath } from '@contentlayer/utils'
import type { HasClock, HasConsole } from '@contentlayer/utils/effect'
import { OT, pipe, provideConsole, T } from '@contentlayer/utils/effect'
import { NodeFsLive } from '@contentlayer/utils/node'
import { describe, expect, test } from 'vitest'

import { provideDocumentContext } from '../../fetchData/DocumentContext.js'
import { testOnly_getDataForFieldDef as getDataForFieldDef } from '../../fetchData/mapping/index.js'

const __unusedValue: any = ''

describe('getDataForFieldDef', () => {
  const testValue = async ({
    type,
    expectedValue,
    rawFieldData,
    options,
  }: {
    type: 'date'
    rawFieldData: any
    expectedValue: any
    options?: Partial<core.PluginOptions>
  }) => {
    const transformedData = await pipe(
      getDataForFieldDef({
        rawFieldData,
        isRootDocument: true,
        coreSchemaDef: { hash: '', documentTypeDefMap: {}, nestedTypeDefMap: {} },
        contentDirPath: __unusedValue,
        fieldDef: {
          type,
          name: 'someField',
          isSystemField: false,
          isRequired: false,
          default: undefined,
          description: undefined,
        },
        documentFilePath: __unusedValue,
        options: {
          fieldOptions: core.defaultFieldOptions,
          markdown: undefined,
          mdx: undefined,
          date: undefined,
          disableImportAliasWarning: false,
          experimental: { enableDynamicBuild: false },
          onSuccess: undefined,
          ...options,
        },
      }),
      provideTestDocumentContext({ relativeFilePath: __unusedValue, documentTypeDefName: __unusedValue }),
      OT.withSpan('testValue'),
      runPromise,
    )

    expect(transformedData).toBe(expectedValue)
  }

  test('only year', () => testValue({ type: 'date', rawFieldData: '2022', expectedValue: '2022-01-01T00:00:00.000Z' }))

  test('null', () => testValue({ type: 'date', rawFieldData: null, expectedValue: null }))

  test('date with slash separators', () =>
    testValue({ type: 'date', rawFieldData: '2022/10/12', expectedValue: '2022-10-12T00:00:00.000Z' }))

  test('date with dash separators', () =>
    testValue({ type: 'date', rawFieldData: '2022-10-12', expectedValue: '2022-10-12T00:00:00.000Z' }))

  test('with timezone option but date str without tz', () =>
    testValue({
      type: 'date',
      rawFieldData: '2022-10-12',
      expectedValue: '2022-10-12T04:00:00Z',
      options: { date: { timezone: 'America/New_York' } }, // NY is UTC+4
    }))

  test('iso date str with tz should ignore timezone option', () =>
    testValue({
      type: 'date',
      rawFieldData: '2022-10-12T07:00:00.000Z',
      expectedValue: '2022-10-12T07:00:00.000Z',
      options: { date: { timezone: 'America/New_York' } }, // NY is UTC+4
    }))

  // Skip this test for now as Temporal doesn't seem to support `new Date().toUTCString()` format yet
  test.skip('utc date str with tz should ignore timezone option', () =>
    testValue({
      type: 'date',
      rawFieldData: 'Fri, 05 Aug 2022 11:12:18 GMT',
      expectedValue: '2022-08-05T15:12:18Z',
      options: { date: { timezone: 'America/New_York' } }, // NY is UTC+4
    }))
})

test('getDataForFieldDef error', async () => {
  const testValue = async ({
    type,
    rawFieldData,
    options,
  }: {
    type: 'date'
    rawFieldData: any
    options?: Partial<core.PluginOptions>
  }) => {
    const documentFilePath = unknownToRelativePosixFilePath('some/path/doc.md')
    const transformedData = await runPromise(
      pipe(
        getDataForFieldDef({
          rawFieldData,
          isRootDocument: true,
          coreSchemaDef: {
            hash: '',
            documentTypeDefMap: { Post: { name: 'Post', _tag: 'DocumentTypeDef', ...__unusedValue } },
            nestedTypeDefMap: {},
          },
          contentDirPath: __unusedValue,
          fieldDef: {
            type,
            name: 'someDate',
            isSystemField: false,
            isRequired: false,
            default: undefined,
            description: undefined,
          },
          documentFilePath,
          options: {
            fieldOptions: core.defaultFieldOptions,
            markdown: undefined,
            mdx: undefined,
            date: undefined,
            disableImportAliasWarning: false,
            experimental: { enableDynamicBuild: false },
            onSuccess: undefined,
            ...options,
          },
        }),
        provideTestDocumentContext({ relativeFilePath: documentFilePath, documentTypeDefName: 'Post' }),
        T.either,
      ),
    )

    expect(transformedData._tag).toBe('Left')
    expect(transformedData).toMatchInlineSnapshot(`
      Left {
        "_tag": "Left",
        "left": IncompatibleFieldDataError {
          "_tag": "IncompatibleFieldDataError",
          "category": "MissingOrIncompatibleData",
          "documentFilePath": "some/path/doc.md",
          "documentTypeDef": {
            "_tag": "DocumentTypeDef",
            "name": "Post",
          },
          "incompatibleFieldData": [
            [
              "someDate",
              "2022-0",
            ],
          ],
          "renderHeadline": [Function],
          "renderLine": [Function],
          Symbol(): {
            "documentFilePath": "some/path/doc.md",
            "documentTypeDef": {
              "_tag": "DocumentTypeDef",
              "name": "Post",
            },
            "incompatibleFieldData": [
              [
                "someDate",
                "2022-0",
              ],
            ],
          },
          Symbol(): [
            "documentFilePath",
            "documentTypeDef",
            "incompatibleFieldData",
          ],
        },
      }
    `)
  }

  await testValue({ type: 'date', rawFieldData: '2022-0' })
})

const runPromise = <A>(eff: T.Effect<OT.HasTracer & HasClock & HasConsole & HasCwd & fs.HasFs, unknown, A>) =>
  pipe(
    eff,
    provideTracing('contentlayer-test'),
    provideConsole,
    provideCwd,
    T.provideSomeLayer(NodeFsLive),
    T.runPromise,
  )

const provideTestDocumentContext = ({
  documentTypeDefName,
  relativeFilePath,
}: {
  documentTypeDefName: string
  relativeFilePath: string
}) =>
  provideDocumentContext({
    rawContent: __unusedValue,
    relativeFilePath: unknownToRelativePosixFilePath(relativeFilePath),
    rawDocumentData: __unusedValue,
    documentTypeDef: {
      _tag: 'DocumentTypeDef',
      name: documentTypeDefName,
    } as any,
  })
