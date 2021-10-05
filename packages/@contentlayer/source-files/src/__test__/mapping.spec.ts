import { expect, test } from '@playwright/test'

import { getFlattenedPath } from '../fetchData/mapping.js'

test.describe('getFlattenedPath', () => {
  test('should flatten path', async () => {
    expect(getFlattenedPath('some/path/doc.md')).toBe('some/path/doc')
    expect(getFlattenedPath('some/path/index.md')).toBe('some/path')
    expect(getFlattenedPath('some/index/index.md')).toBe('some/index')
    expect(getFlattenedPath('index/index.md')).toBe('index')
    expect(getFlattenedPath('index.md')).toBe('')
  })
})
