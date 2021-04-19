import { config, post } from 'contentlayer/types'
import React, { FC } from 'react'
import { BlogPostFooter } from '../components/BlogPostFooter'
import { Layout } from '../components/Layout'
import { htmlToReact, markdownify, withPrefix } from '../utils'

export const PostLayout: FC<{
  doc: post
  config: config
}> = ({ config, doc }) => (
  <Layout config={config} doc={doc}>
    <div className="outer">
      <div className="inner-medium">
        <article className="post post-full">
          <header className="post-header">
            <h1 className="post-title">{doc.title}</h1>
            {doc.subtitle && <div className="post-subtitle">{htmlToReact(doc.subtitle)}</div>}
          </header>
          {doc.image && (
            <div className="post-image">
              <img src={withPrefix(doc.image)} alt={doc.image_alt ?? ''} />
            </div>
          )}
          <div className="post-content">{markdownify(doc.content)}</div>
          <BlogPostFooter post={doc} dateType="long" />
        </article>
      </div>
    </div>
  </Layout>
)
