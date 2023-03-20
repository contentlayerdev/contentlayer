import { pipe, T } from '@contentlayer/utils/effect'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

import { NotionRenderer } from '../services.js'
import { UnknownNotionError } from './errors.js'

export const fetchPageContent = ({ page }: { page: PageObjectResponse }) =>
  pipe(
    T.service(NotionRenderer),
    T.chain((renderer) => T.tryPromise(() => renderer.renderBlock(page.id))),
    T.mapError((error) => new UnknownNotionError({ error })),
  )
