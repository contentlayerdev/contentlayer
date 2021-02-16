import React from 'react';
import _ from 'lodash';

import {markdownify} from '../utils';
import FormField from './FormField';

export default class FooterForm extends React.Component {
    render() {
        let section = _.get(this.props, 'section', null);
        return (
            <section className="cell widget widget-form">
              {_.get(section, 'title', null) && (
              <h2 className="widget-title">{_.get(section, 'title', null)}</h2>
              )}
              {markdownify(_.get(section, 'content', null))}
              <form name={_.get(section, 'form_id', null)} id={_.get(section, 'form_id', null)} {...(_.get(section, 'form_action', null) ? ({action: _.get(section, 'form_action', null)}) : null)} method="POST" data-netlify="true"
                data-netlify-honeypot={_.get(section, 'form_id', null) + '-bot-field'}>
                <div className="screen-reader-text">
                  <label id={_.get(section, 'form_id', null) + '-honeypot-label'} htmlFor={_.get(section, 'form_id', null) + '-honeypot'}>Don't fill this out if you're
                    human:</label>
                  <input aria-labelledby={_.get(section, 'form_id', null) + '-honeypot-label'} id={_.get(section, 'form_id', null) + '-honeypot'}
                    name={_.get(section, 'form_id', null) + '-bot-field'} />
                </div>
                <input aria-labelledby={_.get(section, 'form_id', null) + '-honeypot-label'} type="hidden" name="form-name"
                  value={_.get(section, 'form_id', null)} />
                {_.map(_.get(section, 'form_fields', null), (field, field_idx) => (
                <div key={field_idx} className="form-row">
                  <FormField {...this.props} field={field} />
                </div>
                ))}
                <div className="form-row">
                  <button type="submit" className="button">{_.get(section, 'submit_label', null)}</button>
                </div>
              </form>
            </section>
        );
    }
}
