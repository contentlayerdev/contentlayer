import { OT, pipe, T } from '@contentlayer/utils/effect'
import * as notion from '@notionhq/client'

import { UnknownNotionError } from './notion/errors.js'

export const getEnvironment = ({
  internalIntegrationToken,
}: {
  internalIntegrationToken: string
}): T.Effect<OT.HasTracer, UnknownNotionError, notion.Client> => {
  const client = new notion.Client({ auth: internalIntegrationToken })
  return pipe(
    T.tryPromise(() => Promise.resolve(client)),
    OT.withSpan('@contentlayer/source-notion/notion:getEnvironment'),
    T.mapError((error) => new UnknownNotionError({ error })),
  )
}
