import type { FC } from 'react'
import React from 'react'

import { Layout } from '../components/Layout'
import { htmlToReact, markdownify, withPrefix } from '../utils'
import type * as types from '.contentlayer/types'

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
          <div className="post-content">{markdownify(page.body.raw)}</div>
        </article>
      </div>
    </div>
  </Layout>
)
