import { expect, test } from 'vitest'

import { convertSchema } from '../cli/convert.js'
import { toYamlString } from '../cli/utils.js'
import * as fixtures from './fixtures/index.js'

test('azimuth schema', async () => {
  const coreSchema = await fixtures.makeAzimuthSchema()
  expect(coreSchema).toMatchSnapshot()
  const stackbitConfig = toYamlString(convertSchema(coreSchema, {}))
  expect(stackbitConfig).toMatchSnapshot()
})

test('blog schema', async () => {
  const coreSchema = await fixtures.makeBlogSchema()
  expect(coreSchema).toMatchSnapshot()
  const stackbitConfig = toYamlString(convertSchema(coreSchema, {}))
  expect(stackbitConfig).toMatchSnapshot()
})
