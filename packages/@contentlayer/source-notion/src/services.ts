import { tag } from '@contentlayer/utils/effect'
import type { NotionRenderer as ONotionRenderer } from '@notion-render/client'
import type * as notion from '@notionhq/client'

export const NotionClient = tag<notion.Client>('NotionClient')
export const NotionRenderer = tag<ONotionRenderer>('NotionRenderer')
