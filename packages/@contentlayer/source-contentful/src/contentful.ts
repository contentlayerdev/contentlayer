import { OT, pipe, T } from '@contentlayer2/utils/effect'
import { createClient } from 'contentful-management'

import { UnknownContentfulError } from './errors.js'
import type { Contentful } from './types.js'

export const environmentGetContentTypes = (
  environment: Contentful.Environment,
): T.Effect<OT.HasTracer, UnknownContentfulError, Contentful.ContentType[]> =>
  pipe(
    T.tryCatchPromise(
      () => environment.getContentTypes().then((_) => _.items),
      (error) => new UnknownContentfulError({ error }),
    ),
    OT.withSpan('@contentlayer2/source-contentlayer/contentful:environmentGetContentTypes'),
  )

export const environmentGetEntries = ({
  limit,
  skip,
  environment,
}: {
  limit: number
  skip?: number
  environment: Contentful.Environment
}): T.Effect<OT.HasTracer, UnknownContentfulError, Contentful.Collection<Contentful.Entry, any>> =>
  pipe(
    T.tryCatchPromise(
      () => environment.getEntries({ limit, skip }),
      (error) => new UnknownContentfulError({ error }),
    ),
    OT.withSpan('@contentlayer2/source-contentlayer/contentful:environmentGetEntries'),
  )

export const environmentGetAssets = ({
  limit,
  skip,
  environment,
}: {
  limit: number
  skip?: number
  environment: Contentful.Environment
}): T.Effect<OT.HasTracer, UnknownContentfulError, Contentful.Collection<Contentful.Asset, any>> =>
  pipe(
    T.tryCatchPromise(
      () => environment.getAssets({ limit, skip }),
      (error) => new UnknownContentfulError({ error }),
    ),
    OT.withSpan('@contentlayer2/source-contentlayer/contentful:environmentGetAssets'),
  )

export const getEnvironment = ({
  accessToken,
  spaceId,
  environmentId,
}: {
  accessToken: string
  spaceId: string
  environmentId: string
}): T.Effect<OT.HasTracer, UnknownContentfulError, Contentful.Environment> => {
  const client = createClient({ accessToken })
  return pipe(
    T.tryPromise(() => client.getSpace(spaceId)),
    T.chain((space) => T.tryPromise(() => space.getEnvironment(environmentId))),
    OT.withSpan('@contentlayer2/source-contentlayer/contentful:getEnvironment'),
    T.mapError((error) => new UnknownContentfulError({ error })),
  )
}
