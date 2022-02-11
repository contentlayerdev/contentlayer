import { defineDocument } from 'contentlayer/source-files/schema'
import type { FC } from 'react'
import React from 'react'

import { BlogPostFooter } from '../components/BlogPostFooter'
import { Layout } from '../components/Layout'
import { Person } from '../contentlayer/documents/Person'
import { SEOModel } from '../contentlayer/objects/SEO'
import { htmlToReact, withPrefix } from '../utils'
import { urlFromFilePath } from '../utils/contentlayer'
import type * as types from 'contentlayer/generated'

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
          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content?.html ?? '' }} />
          {/* <div className="post-content">{markdownify(doc.content)}</div> */}
          <BlogPostFooter post={post} dateType="long" />
        </article>
      </div>
    </div>
  </Layout>
)

export const PostModel = defineDocument(() => ({
  name: 'Post',
  filePathPattern: `pages/blog/**/*.md`,
  fields: {
    title: {
      type: 'string',
      label: 'Title',
      description: 'The title of the post',
      required: true,
    },
    subtitle: {
      type: 'string',
      label: 'Subtitle',
      description: 'The text shown just below the title or the featured image',
    },
    date: {
      type: 'date',
      label: 'Date',
      required: true,
    },
    author: {
      type: 'reference',
      description: 'Post author',
      document: Person,
    },
    excerpt: {
      type: 'string',
      label: 'Excerpt',
      description: 'The excerpt of the post displayed in the blog feed',
    },
    image: {
      type: 'image',
      label: 'Image (single post)',
      description: 'The image shown below the title',
    },
    image_alt: {
      type: 'string',
      label: 'Image alt text (single post)',
      description: 'The alt text of the featured image',
    },
    thumb_image: {
      type: 'image',
      label: 'Image (blog feed)',
      description: 'The image shown in the blog feed',
    },
    thumb_image_alt: {
      type: 'string',
      label: 'Image alt text (blog feed)',
      description: 'The alt text of the blog feed image',
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
