import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // See README.md for more information why this is needed
    threads: false,
  },
})
