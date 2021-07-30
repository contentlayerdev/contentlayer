import { defineEmbedded } from 'contentlayer/source-local/schema'
import type { FC } from 'react'
import React from 'react'

import { htmlToReact, Link, withPrefix } from '../../utils'
import { BlogPostFooter } from '../BlogPostFooter'
import { sectionBaseFields } from './model'
import type * as types from '.contentlayer/types'

export const SectionPosts: FC<{ section: types.SectionPosts; posts: types.Post[] }> = ({ section, posts }) => {
  const recentPosts = posts
    // TODO do proper date constructing
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  return (
    <section id={section.section_id} className={'block posts-block bg-' + section.background + ' outer'}>
      <div className="block-header inner-small">
        {section.title && <h2 className="block-title">{section.title}</h2>}
        {section.subtitle && <p className="block-subtitle">{htmlToReact(section.subtitle)}</p>}
      </div>
      <div className="inner">
        <div className="grid post-feed">
          {recentPosts.map((post, post_idx) => (
            <article key={post_idx} className="cell post">
              <div className="card">
                {post.thumb_image && (
                  <Link className="post-thumbnail" href={withPrefix(post.url_path)}>
                    <img src={withPrefix(post.thumb_image)} alt={post.thumb_image_alt} />
                  </Link>
                )}
                <div className="post-body">
                  <header className="post-header">
                    <h3 className="post-title">
                      <Link href={withPrefix(post.url_path)}>{post.title}</Link>
                    </h3>
                  </header>
                  <div className="post-excerpt">
                    <p>{post.excerpt}</p>
                  </div>
                  <BlogPostFooter post={post} dateType={'short'} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export const SectionPostsModel = defineEmbedded(() => ({
  name: 'SectionPosts',
  label: 'Posts List',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      label: 'Subtitle',
      description: 'The subtitle of the section',
    },
    background: {
      type: 'enum',
      label: 'Background',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
  },
}))
