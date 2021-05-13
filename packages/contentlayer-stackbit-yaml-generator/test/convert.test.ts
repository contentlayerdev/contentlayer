import { convertSchema } from '../src/convert'
import { toYamlString } from '../src/utils'
import * as fixtures from './fixtures'

describe('convert', () => {
  it('azimuth schema', async () => {
    const coreSchema = await fixtures.makeAzimuthSchema()
    expect(coreSchema).toMatchSnapshot()
    const stackbitConfig = toYamlString(convertSchema(coreSchema))
    expect(stackbitConfig).toMatchSnapshot()
  })

  it('blog schema', async () => {
    const coreSchema = await fixtures.makeBlogSchema()
    expect(coreSchema).toMatchSnapshot()
    const stackbitConfig = toYamlString(convertSchema(coreSchema))
    expect(stackbitConfig).toMatchSnapshot()
  })
})
