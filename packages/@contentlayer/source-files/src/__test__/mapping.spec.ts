import * as core from '@contentlayer/core'
import { DummyTracing } from '@contentlayer/utils'
import type { HasClock, HasConsole, OT } from '@contentlayer/utils/effect'
import { pipe, provideConsole, T } from '@contentlayer/utils/effect'
import test from 'ava'

import type { HasDocumentContext } from '../fetchData/DocumentContext.js'
import { provideDocumentContext } from '../fetchData/DocumentContext.js'
import { getFlattenedPath, testOnly_getDataForFieldDef as getDataForFieldDef } from '../fetchData/mapping.js'

test('getFlattenedPath', async (t) => {
  t.is(getFlattenedPath('some/path/doc.md'), 'some/path/doc')
  t.is(getFlattenedPath('some/path/index.md'), 'some/path')
  t.is(getFlattenedPath('some/index/index.md'), 'some/index')
  t.is(getFlattenedPath('index/index.md'), 'index')
  t.is(getFlattenedPath('index.md'), '')
})

const __unusedValue: any = ''

test('getDataForFieldDef', async (t) => {
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
        contentDirPath: __unusedValue,
        fieldDef: {
          type,
          name: 'someField',
          isSystemField: false,
          isRequired: false,
          default: undefined,
          description: undefined,
        },
        coreSchemaDef: { hash: '', documentTypeDefMap: {}, nestedTypeDefMap: {} },
        relativeFilePath: __unusedValue,
        options: {
          fieldOptions: core.defaultFieldOptions,
          markdown: undefined,
          mdx: undefined,
          date: undefined,
          ...options,
        },
      }),
    )

    t.is(transformedData, expectedValue)
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

const runPromise = (eff: T.Effect<OT.HasTracer & HasClock & HasConsole & HasDocumentContext, unknown, any>) =>
  pipe(eff, T.provide(DummyTracing), provideConsole, provideTestDocumentContext, T.runPromise)

const provideTestDocumentContext = provideDocumentContext({
  rawContent: __unusedValue,
  relativeFilePath: __unusedValue,
})
