import { SourcePlugin } from '@sourcebit/core'
import { fetchData } from './fetchData'
import { provideSchema } from './provideSchema'

export const plugin: SourcePlugin = {
  provideSchema,
  fetchData,
}
