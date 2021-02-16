import React from 'react';
import _ from 'lodash';

import {htmlToReact, getPages, Link, withPrefix} from '../utils';
import BlogPostFooter from './BlogPostFooter';

export default class SectionPosts extends React.Component {
    render() {
        let section = _.get(this.props, 'section', null);
        let display_posts = _.orderBy(getPages(this.props.pages, '/blog'), 'frontmatter.date', 'desc');
        let recent_posts = display_posts.slice(0, 3);
        return (
            <section id={_.get(section, 'section_id', null)} className={'block posts-block bg-' + _.get(section, 'background', null) + ' outer'}>
              <div className="block-header inner-small">
                {_.get(section, 'title', null) && (
                <h2 className="block-title">{_.get(section, 'title', null)}</h2>
                )}
                {_.get(section, 'subtitle', null) && (
                <p className="block-subtitle">
                  {htmlToReact(_.get(section, 'subtitle', null))}
                </p>
                )}
              </div>
              <div className="inner">
                <div className="grid post-feed">
                  {_.map(recent_posts, (post, post_idx) => (
                  <article key={post_idx} className="cell post">
                    <div className="card">
                      {_.get(post, 'frontmatter.thumb_image', null) && (
                      <Link className="post-thumbnail" href={withPrefix(_.get(post, '__metadata.urlPath', null))}>
                        <img src={withPrefix(_.get(post, 'frontmatter.thumb_image', null))} alt={_.get(post, 'frontmatter.thumb_image_alt', null)} />
                      </Link>
                      )}
                      <div className="post-body">
                        <header className="post-header">
                          <h3 className="post-title"><Link href={withPrefix(_.get(post, '__metadata.urlPath', null))}>{_.get(post, 'frontmatter.title', null)}</Link></h3>
                        </header>
                        <div className="post-excerpt">
                          <p>{_.get(post, 'frontmatter.excerpt', null)}</p>
                        </div>
                        <BlogPostFooter {...this.props} page={post} date_type={'short'} />
                      </div>
                    </div>
                  </article>
                  ))}
                </div>
              </div>
            </section>
        );
    }
}
