import { SourcePlugin } from '@sourcebit/sdk'
import { fetchData } from './fetchData'
import { provideSchema } from './provideSchema'

export const plugin: SourcePlugin = {
  provideSchema,
  fetchData,
}
