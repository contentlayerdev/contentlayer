import * as core from '@contentlayer/core'
import { DummyTracing } from '@contentlayer/utils'
import type { HasClock, OT } from '@contentlayer/utils/effect'
import { pipe, T } from '@contentlayer/utils/effect'
import t from 'tap'

import { getFlattenedPath, testOnly_getDataForFieldDef as getDataForFieldDef } from '../fetchData/mapping.js'

t.test('getFlattenedPath', async (t) => {
  t.equal(getFlattenedPath('some/path/doc.md'), 'some/path/doc')
  t.equal(getFlattenedPath('some/path/index.md'), 'some/path')
  t.equal(getFlattenedPath('some/index/index.md'), 'some/index')
  t.equal(getFlattenedPath('index/index.md'), 'index')
  t.equal(getFlattenedPath('index.md'), '')
})

const __unusedValue: any = ''

t.test('getDataForFieldDef', async (t) => {
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

    t.equal(transformedData, expectedValue)
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

const runPromise = (eff: T.Effect<OT.HasTracer & HasClock, unknown, any>) =>
  pipe(eff, T.provide(DummyTracing), T.runPromise)
