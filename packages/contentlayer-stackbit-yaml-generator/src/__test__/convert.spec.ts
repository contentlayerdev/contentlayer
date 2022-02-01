import test from 'ava'

import { convertSchema } from '../cli/convert.js'
import { toYamlString } from '../cli/utils.js'
import * as fixtures from './fixtures/index.js'

test('azimuth schema', async (t) => {
  const coreSchema = await fixtures.makeAzimuthSchema()
  t.snapshot(coreSchema)
  const stackbitConfig = toYamlString(convertSchema(coreSchema, {}))
  t.snapshot(stackbitConfig)
})

test('blog schema', async (t) => {
  const coreSchema = await fixtures.makeBlogSchema()
  t.snapshot(coreSchema)
  const stackbitConfig = toYamlString(convertSchema(coreSchema, {}))
  t.snapshot(stackbitConfig)
})
