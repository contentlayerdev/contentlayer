import { Observable, SourcePlugin } from '@sourcebit/core'
import { fetchData } from './fetchData'
import { provideSchema } from './provideSchema'

type MakeSourcePlugin = (_: { studioDirPath: string }) => SourcePlugin

export const makeSourcePlugin: MakeSourcePlugin = ({ studioDirPath }) => ({
  provideSchema: () => provideSchema(studioDirPath),
  fetchData: async ({ watch }) => {
    return new Observable((observer) => {
      provideSchema(studioDirPath).then((schemaDef) => {
        fetchData({ studioDirPath, schemaDef }).then((_) => {
          observer.next(_)

          if (!watch) {
            observer.complete()
          }
        })

        if (watch) {
          throw new Error(`Watch mode not yet implemented for Sanity source`)
        }
      })
    })
  },
})
