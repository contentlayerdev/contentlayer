import { section_faq } from 'contentlayer/types'
import React, { FC } from 'react'
import { htmlToReact, markdownify } from '../../utils'

export const SectionFaq: FC<{ section: section_faq }> = ({ section }) => (
  <section id={section.section_id} className={'block faq-block bg-' + section.background + ' outer'}>
    <div className="inner-small">
      <div className="block-header">
        {section.title && <h2 className="block-title">{section.title}</h2>}
        {section.subtitle && <p className="block-subtitle">{htmlToReact(section.subtitle)}</p>}
      </div>
      {section.faq_items && (
        <div className="faq-accordion handorgel">
          {section.faq_items.map((faqitem, faqitem_idx) => (
            <React.Fragment key={faqitem_idx + '.2'}>
              <h3 key={faqitem_idx} className="faq-accordion-header handorgel__header">
                <button className="handorgel__trigger">
                  <span>{faqitem.question}</span>
                  <span className="handorgel__icon icon-plus" />
                </button>
              </h3>
              <div key={faqitem_idx + '.1'} className="faq-accordion-content handorgel__content">
                <div className="handorgel__content-inner">{markdownify(faqitem.answer)}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  </section>
)
