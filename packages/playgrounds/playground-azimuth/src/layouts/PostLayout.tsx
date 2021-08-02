import type { FC } from 'react'
import React from 'react'

import { BlogPostFooter } from '../components/BlogPostFooter'
import { Layout } from '../components/Layout'
import { htmlToReact, withPrefix } from '../utils'
import type * as types from '.contentlayer/types'

export const PostLayout: FC<{
  post: types.Post
  config: types.Config
}> = ({ config, post }) => (
  <Layout config={config} doc={post}>
    <div className="outer">
      <div className="inner-medium">
        <article className="post post-full">
          <header className="post-header">
            <h1 className="post-title">{post.title}</h1>
            {post.subtitle && <div className="post-subtitle">{htmlToReact(post.subtitle)}</div>}
          </header>
          {post.image && (
            <div className="post-image">
              <img src={withPrefix(post.image)} alt={post.image_alt ?? ''} />
            </div>
          )}
          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content.html }} />
          {/* <div className="post-content">{markdownify(doc.content)}</div> */}
          <BlogPostFooter post={post} dateType="long" />
        </article>
      </div>
    </div>
  </Layout>
)
