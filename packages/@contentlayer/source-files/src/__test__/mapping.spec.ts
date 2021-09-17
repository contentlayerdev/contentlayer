import { getFlattenedPath } from '../fetchData/mapping'

describe('getFlattenedPath', () => {
  it('should flatten path', () => {
    expect(getFlattenedPath('some/path/doc.md')).toBe('some/path/doc')
    expect(getFlattenedPath('some/path/index.md')).toBe('some/path')
    expect(getFlattenedPath('some/index/index.md')).toBe('some/index')
    expect(getFlattenedPath('index/index.md')).toBe('index')
    expect(getFlattenedPath('index.md')).toBe('')
  })
})
