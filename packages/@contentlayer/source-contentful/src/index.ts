import type * as core from '@contentlayer/core'
import { processArgs } from '@contentlayer/core'
import { pipe, S, SC, T } from '@contentlayer/utils/effect'

import { fetchAllDocuments } from './fetchData/index.js'
import { provideSchema } from './provideSchema.js'
import type * as SchemaOverrides from './schemaOverrides.js'
import type { PluginOptions } from './types.js'

export type { RawDocumentData } from './types.js'

export type Args = {
  accessToken: string
  spaceId: string
  environmentId?: string
  /**
   * Since Contentful only provides one kind of content types this schema overrides argument allows you
   * to turn relations into embedded objects. Either provide an array of type names via `objectTypes` or `documentTypes`.
   * By default all Contentful content types are treated as document types.
   *
   * In case a type name has be re-mapped using `typeNameMapping` please use your choosen type name
   */
  schemaOverrides?: SchemaOverrides.Input.SchemaOverrides
}

export const makeSourcePlugin: core.MakeSourcePlugin<Args & PluginOptions> = (args) => async () => {
  const {
    options,
    extensions,
    restArgs: { accessToken, spaceId, environmentId = 'master', schemaOverrides = {} },
  } = await processArgs(args, undefined)

  return {
    type: 'contentful',
    extensions,
    options,
    provideSchema: () => provideSchema({ accessToken, spaceId, environmentId, options, schemaOverrides }),
    fetchData: ({ schemaDef }) =>
      pipe(
        S.fromEffect(
          pipe(
            fetchAllDocuments({ accessToken, spaceId, environmentId, schemaDef, schemaOverrides, options }),
            T.either,
          ),
        ),
        // TODO remove polling and implement "properly"
        S.repeatSchedule(SC.spaced(5_000)),
      ),
  }
}
