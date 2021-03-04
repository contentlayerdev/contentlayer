import { section_reviews } from '@sourcebit/sdk/types'
import React, { FC } from 'react'
import { htmlToReact, withPrefix } from '../../utils'

const SectionReviews: FC<{ section: section_reviews }> = ({ section }) => (
  <section id={section.section_id} className={'block reviews-block bg-' + section.background + ' outer'}>
    <div className="block-header inner-small">
      {section.title && <h2 className="block-title">{section.title}</h2>}
      {section.subtitle && <p className="block-subtitle">{htmlToReact(section.subtitle)}</p>}
    </div>
    {section.reviews && (
      <div className="inner">
        <div className="grid">
          {section.reviews.map((review, review_idx) => (
            <blockquote key={review_idx} className="cell review">
              <div className="card">
                <p className="review-text">{htmlToReact(review.content)}</p>
                <footer className="review-footer">
                  {review.avatar && (
                    <img className="review-avatar" src={withPrefix(review.avatar)} alt={review.author} />
                  )}
                  <cite className="review-author">{review.author}</cite>
                </footer>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    )}
  </section>
)

export default SectionReviews
