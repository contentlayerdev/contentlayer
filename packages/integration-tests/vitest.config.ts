import { defineConfig } from 'vitest/config'

const nodeVersion = parseInt(process.version.match(/^v(\d+\.\d+)/)![1]!)

export default defineConfig({
  test: {
    // See README.md for more information why this is needed
    threads: nodeVersion >= 18 ? true : false,
  },
})
