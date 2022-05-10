import * as core from '@contentlayer/core'
import { DummyTracing, unknownToPosixFilePath } from '@contentlayer/utils'
import type { HasClock, HasConsole, OT } from '@contentlayer/utils/effect'
import { pipe, provideConsole, T } from '@contentlayer/utils/effect'
import { expect, test } from 'vitest'

import type { HasDocumentContext } from '../fetchData/DocumentContext.js'
import { provideDocumentContext } from '../fetchData/DocumentContext.js'
import { getFlattenedPath, testOnly_getDataForFieldDef as getDataForFieldDef } from '../fetchData/mapping.js'

test('getFlattenedPath', () => {
  expect(getFlattenedPath('some/path/doc.md')).toBe('some/path/doc')
  expect(getFlattenedPath('some/path/index.md')).toBe('some/path')
  expect(getFlattenedPath('some/index/index.md')).toBe('some/index')
  expect(getFlattenedPath('index/index.md')).toBe('index')
  expect(getFlattenedPath('index.md')).toBe('')
})

const __unusedValue: any = ''

test('getDataForFieldDef', async () => {
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
    const transformedData = await runPromise(
      getDataForFieldDef({
        rawFieldData,
        typeName: __unusedValue,
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
        relativeFilePath: __unusedValue,
        options: {
          fieldOptions: core.defaultFieldOptions,
          markdown: undefined,
          mdx: undefined,
          date: undefined,
          disableImportAliasWarning: false,
          ...options,
        },
      }),
    )

    expect(transformedData).toBe(expectedValue)
  }

  await testValue({ type: 'date', rawFieldData: '2022', expectedValue: '2022-01-01T00:00:00.000Z' })
  await testValue({ type: 'date', rawFieldData: '2022/10/12', expectedValue: '2022-10-12T00:00:00.000Z' })
  await testValue({ type: 'date', rawFieldData: '2022-10-12', expectedValue: '2022-10-12T00:00:00.000Z' })
  await testValue({
    type: 'date',
    rawFieldData: '2022-10-12',
    expectedValue: '2022-10-12T04:00:00.000Z',
    options: { date: { timezone: 'America/New_York' } },
  })
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
    const transformedData = await runPromise(
      pipe(
        getDataForFieldDef({
          rawFieldData,
          typeName: 'Post',
          coreSchemaDef: { hash: '', documentTypeDefMap: {}, nestedTypeDefMap: {} },
          contentDirPath: __unusedValue,
          fieldDef: {
            type,
            name: 'someDate',
            isSystemField: false,
            isRequired: false,
            default: undefined,
            description: undefined,
          },
          relativeFilePath: unknownToPosixFilePath('some/path/doc.md'),
          options: {
            fieldOptions: core.defaultFieldOptions,
            markdown: undefined,
            mdx: undefined,
            date: undefined,
            disableImportAliasWarning: false,
            ...options,
          },
        }),
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
          "documentTypeName": "Post",
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
            "documentTypeName": "Post",
            "incompatibleFieldData": [
              [
                "someDate",
                "2022-0",
              ],
            ],
          },
          Symbol(): [
            "documentFilePath",
            "documentTypeName",
            "incompatibleFieldData",
          ],
        },
      }
    `)
  }

  await testValue({ type: 'date', rawFieldData: '2022-0' })
})

const runPromise = <A>(eff: T.Effect<OT.HasTracer & HasClock & HasConsole & HasDocumentContext, unknown, A>) =>
  pipe(eff, T.provide(DummyTracing), provideConsole, provideTestDocumentContext, T.runPromise)

const provideTestDocumentContext = provideDocumentContext({
  rawContent: __unusedValue,
  relativeFilePath: __unusedValue,
  rawDocumentData: __unusedValue,
})
