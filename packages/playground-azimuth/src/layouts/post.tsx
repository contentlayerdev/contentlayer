import React, { FC } from 'react'
import _ from 'lodash'
import { Layout } from '../components'
import { htmlToReact, withPrefix, markdownify } from '../utils'
import BlogPostFooter from '../components/BlogPostFooter'

const Post: FC<{
  doc: SourcebitGen['typeMap']['post']
  config: SourcebitGen['typeMap']['config']
}> = ({ config, doc, ...props }) => (
  <Layout config={config} doc={doc}>
    <div className="outer">
      <div className="inner-medium">
        <article className="post post-full">
          <header className="post-header">
            <h1 className="post-title">{doc.title}</h1>
            {doc.subtitle && (
              <div className="post-subtitle">{htmlToReact(doc.subtitle)}</div>
            )}
          </header>
          {doc.image && (
            <div className="post-image">
              <img src={withPrefix(doc.image)} alt={doc.image_alt ?? ''} />
            </div>
          )}
          <div className="post-content">{markdownify(doc.__content)}</div>
          <BlogPostFooter {...props} doc={doc} date_type={'long'} />
        </article>
      </div>
    </div>
  </Layout>
)

export default Post
