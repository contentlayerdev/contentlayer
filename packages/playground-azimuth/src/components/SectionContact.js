import React from 'react';
import _ from 'lodash';

import {htmlToReact, markdownify} from '../utils';
import FormField from './FormField';

export default class SectionContact extends React.Component {
    render() {
        let section = _.get(this.props, 'section', null);
        return (
            <section id={_.get(section, 'section_id', null)} className={'block contact-block bg-' + _.get(section, 'background', null) + ' outer'}>
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
              <div className="block-content inner-medium">
                {markdownify(_.get(section, 'content', null))}
                <form name={_.get(section, 'form_id', null)} id={_.get(section, 'form_id', null)}{...(_.get(section, 'form_action', null) ? ({action: _.get(section, 'form_action', null)}) : null)} method="POST" data-netlify="true" data-netlify-honeypot={_.get(section, 'form_id', null) + '-bot-field'}>
                  <div className="screen-reader-text">
                    <label id={_.get(section, 'form_id', null) + '-honeypot-label'} htmlFor={_.get(section, 'form_id', null) + '-honeypot'}>Don't fill this out if you're human:</label>
                    <input aria-labelledby={_.get(section, 'form_id', null) + '-honeypot-label'} id={_.get(section, 'form_id', null) + '-honeypot'} name={_.get(section, 'form_id', null) + '-bot-field'} />
                  </div>
                  <input aria-labelledby={_.get(section, 'form_id', null) + '-honeypot-label'} type="hidden" name="form-name" value={_.get(section, 'form_id', null)} />
                  {_.map(_.get(section, 'form_fields', null), (field, field_idx) => (
                  <div key={field_idx} className="form-row">
                    <FormField {...this.props} field={field} section={section} />
                  </div>
                  ))}
                  <div className="form-row form-submit">
                    <button type="submit" className="button">{_.get(section, 'submit_label', null)}</button>
                  </div>
                </form>
              </div>
            </section>
        );
    }
}
