import { person, post, section_posts } from 'contentlayer/types'
import React, { FC } from 'react'
import { htmlToReact, Link, withPrefix } from '../../utils'
import { BlogPostFooter } from '../BlogPostFooter'

export const SectionPosts: FC<{ section: section_posts; posts: post[]; persons: person[] }> = ({
  section,
  posts,
  persons,
}) => {
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
                  <BlogPostFooter post={post} dateType={'short'} persons={persons} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
