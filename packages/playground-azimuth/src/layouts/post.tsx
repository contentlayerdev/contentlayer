import { post, site_config } from '@sourcebit/types'
import React, { FC } from 'react'
import { Layout } from '../components'
import BlogPostFooter from '../components/BlogPostFooter'
import { htmlToReact, markdownify, withPrefix } from '../utils'

const Post: FC<{
  doc: post
  config: site_config
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
          <div className="post-content">{markdownify(doc.__content)}</div>
          <BlogPostFooter post={doc} dateType="long" />
        </article>
      </div>
    </div>
  </Layout>
)

export default Post
