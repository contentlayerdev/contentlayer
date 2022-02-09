import { defineEmbedded } from 'contentlayer/source-files/schema'
import type { FC } from 'react'
import React from 'react'

import { htmlToReact, withPrefix } from '../../utils'
import { sectionBaseFields } from './model'
import type * as types from 'contentlayer/generated'

export const SectionReviews: FC<{ section: types.SectionReviews }> = ({ section }) => (
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
                    <img className="review-avatar" src={withPrefix(review.avatar)} alt={review.avatar_alt} />
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

export const SectionReviewsModel = defineEmbedded(() => ({
  name: 'SectionReviews',
  label: 'Reviews Section',
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
    reviews: {
      type: 'list',
      label: 'Reviews',
      of: { type: 'object', object: ReviewItem },
    },
  },
}))

const ReviewItem = defineEmbedded(() => ({
  name: 'ReviewItem',
  label: 'Review Item',
  fields: {
    author: {
      type: 'string',
      label: 'Author',
    },
    avatar: {
      type: 'image',
      label: 'Author Image',
    },
    avatar_alt: {
      type: 'string',
      label: 'Author Image Alt Text',
    },
    content: {
      type: 'text',
      label: 'Content',
    },
  },
}))
