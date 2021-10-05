import t from 'tap'

import { convertSchema } from '../cli/convert.js'
import { toYamlString } from '../cli/utils.js'
import * as fixtures from './fixtures/index.js'

t.test('azimuth schema', async (t) => {
  const coreSchema = await fixtures.makeAzimuthSchema()
  t.matchSnapshot(coreSchema)
  const stackbitConfig = toYamlString(convertSchema(coreSchema, {}))
  t.matchSnapshot(stackbitConfig)
})

t.test('blog schema', async (t) => {
  const coreSchema = await fixtures.makeBlogSchema()
  t.matchSnapshot(coreSchema)
  const stackbitConfig = toYamlString(convertSchema(coreSchema, {}))
  t.matchSnapshot(stackbitConfig)
})
