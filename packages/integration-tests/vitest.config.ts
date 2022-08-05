import os from 'node:os'
import process from 'node:process'
import { defineConfig } from 'vitest/config'

const nodeVersion = parseInt(process.version.match(/^v(\d+\.\d+)/)![1]!)

export default defineConfig({
  test: {
    // See README.md for more information why this is needed
    threads: os.platform() !== 'win32' && nodeVersion >= 18 ? true : false,
  },
})
