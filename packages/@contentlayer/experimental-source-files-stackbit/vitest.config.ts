import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    deps: {
      moduleDirectories: ['node_modules', path.resolve('../../../packages')],
    },
  },
})
