import React from 'react';
import _ from 'lodash';

import {htmlToReact, withPrefix} from '../utils';

export default class SectionReviews extends React.Component {
    render() {
        let section = _.get(this.props, 'section', null);
        return (
            <section id={_.get(section, 'section_id', null)} className={'block reviews-block bg-' + _.get(section, 'background', null) + ' outer'}>
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
              {_.get(section, 'reviews', null) && (
              <div className="inner">
                <div className="grid">
                  {_.map(_.get(section, 'reviews', null), (review, review_idx) => (
                  <blockquote key={review_idx} className="cell review">
                    <div className="card">
                      <p className="review-text">{htmlToReact(_.get(review, 'content', null))}</p>
                      <footer className="review-footer">
                        {_.get(review, 'avatar', null) && (
                        <img className="review-avatar" src={withPrefix(_.get(review, 'avatar', null))} alt={_.get(review, 'author', null)}/>
                        )}
                        <cite className="review-author">{_.get(review, 'author', null)}</cite>
                      </footer>
                    </div>
                  </blockquote>
                  ))}
                </div>
              </div>
              )}
            </section>
        );
    }
}
