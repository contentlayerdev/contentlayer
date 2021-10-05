import t from 'tap'

import { getFlattenedPath } from '../fetchData/mapping.js'

t.test('getFlattenedPath', async (t) => {
  t.equal(getFlattenedPath('some/path/doc.md'), 'some/path/doc')
  t.equal(getFlattenedPath('some/path/index.md'), 'some/path')
  t.equal(getFlattenedPath('some/index/index.md'), 'some/index')
  t.equal(getFlattenedPath('index/index.md'), 'index')
  t.equal(getFlattenedPath('index.md'), '')
})
