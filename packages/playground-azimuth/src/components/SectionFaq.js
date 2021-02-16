import React from 'react';
import _ from 'lodash';

import {htmlToReact, markdownify} from '../utils';

export default class SectionFaq extends React.Component {
    render() {
        let section = _.get(this.props, 'section', null);
        return (
            <section id={_.get(section, 'section_id', null)} className={'block faq-block bg-' + _.get(section, 'background', null) + ' outer'}>
              <div className="inner-small">
                <div className="block-header">
                  {_.get(section, 'title', null) && (
                  <h2 className="block-title">{_.get(section, 'title', null)}</h2>
                  )}
                  {_.get(section, 'subtitle', null) && (
                  <p className="block-subtitle">
                    {htmlToReact(_.get(section, 'subtitle', null))}
                  </p>
                  )}
                </div>
                {_.get(section, 'faq_items', null) && (
                <div className="faq-accordion handorgel">
                  {_.map(_.get(section, 'faq_items', null), (faqitem, faqitem_idx) => (<React.Fragment key={faqitem_idx + '.2'}>
                  <h3 key={faqitem_idx} className="faq-accordion-header handorgel__header">
                    <button className="handorgel__trigger">
                      <span>{_.get(faqitem, 'question', null)}</span>
                      <span className="handorgel__icon icon-plus" />
                    </button>
                  </h3>
                  <div key={faqitem_idx + '.1'} className="faq-accordion-content handorgel__content">
                    <div className="handorgel__content-inner">
                      {markdownify(_.get(faqitem, 'answer', null))}
                    </div>
                  </div>
                  </React.Fragment>))}
                </div>
                )}
              </div>
            </section>
        );
    }
}
