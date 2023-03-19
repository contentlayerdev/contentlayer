import { pipe, T } from '@contentlayer/utils/effect'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

import { NotionRenderer } from '../services'
import { UnknownNotionError } from './errors'

export const fetchPageContent = ({ page }: { page: PageObjectResponse }) =>
  pipe(
    T.service(NotionRenderer),
    T.chain((renderer) => T.tryPromise(() => renderer.renderBlock(page.id))),
    T.mapError((error) => new UnknownNotionError({ error })),
  )
