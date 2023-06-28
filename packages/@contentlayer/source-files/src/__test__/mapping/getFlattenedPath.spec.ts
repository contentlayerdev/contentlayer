import { expect, test } from 'vitest'

import { getFlattenedPath } from '../../fetchData/mapping/index.js'

test('getFlattenedPath', () => {
  expect(getFlattenedPath('some/path/doc.md')).toBe('some/path/doc')
  expect(getFlattenedPath('some/path/index.md')).toBe('some/path')
  expect(getFlattenedPath('some/index/index.md')).toBe('some/index')
  expect(getFlattenedPath('index/index.md')).toBe('index')
  expect(getFlattenedPath('index.md')).toBe('')
  expect(getFlattenedPath('some/sub/path/index.md')).toBe('some/sub/path')
  expect(getFlattenedPath('some/sub/path/some-file-with-index.md')).toBe('some/sub/path/some-file-with-index')
})
