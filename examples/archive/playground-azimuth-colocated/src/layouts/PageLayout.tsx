import { defineDocument } from 'contentlayer/source-files/schema'
import type { FC } from 'react'
import React from 'react'

import { Layout } from '../components/Layout'
import { SEOModel } from '../contentlayer/objects/SEO'
import { htmlToReact, markdownify, withPrefix } from '../utils'
import { urlFromFilePath } from '../utils/contentlayer'
import type * as types from 'contentlayer/generated'

export const PageLayout: FC<{
  page: types.Page
  config: types.Config
}> = ({ config, page }) => (
  <Layout doc={page} config={config}>
    <div className="outer">
      <div className="inner-medium">
        <article className="post post-full">
          <header className="post-header">
            <h1 className="post-title">{page.title}</h1>
            {page.subtitle && <div className="post-subtitle">{htmlToReact(page.subtitle)}</div>}
          </header>
          {page.image && (
            <div className="post-image">
              <img src={withPrefix(page.image)} alt={page.image_alt} />
            </div>
          )}
          {/* TODO type properly */}
          <div className="post-content">{markdownify(page.content)}</div>
        </article>
      </div>
    </div>
  </Layout>
)

export const PageModel = defineDocument(() => ({
  name: 'Page',
  filePathPattern: 'pages/{about,privacy-policy,signup,style-guide,terms-of-service}.md',
  fields: {
    title: {
      type: 'string',
      label: 'Title',
      description: 'The title of the page',
      required: true,
    },
    subtitle: {
      type: 'string',
      label: 'Subtitle',
      description: 'The text shown below the page title',
    },
    image: {
      type: 'image',
      label: 'Image',
      description: 'The image shown below the page title',
    },
    image_alt: {
      type: 'string',
      label: 'Image Alt Text',
      description: 'The alt text of the image',
    },
    seo: {
      type: 'object',
      object: SEOModel,
    },
  },
  computedFields: {
    url_path: {
      type: 'string',
      description:
        'The URL path of this page relative to site root. For example, the site root page would be "/", and post page would be "posts/new-post/"',
      resolve: urlFromFilePath,
    },
  },
}))
