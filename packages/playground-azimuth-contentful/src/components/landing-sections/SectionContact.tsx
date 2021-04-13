import { section_contact } from 'contentlayer/types'
import _ from 'lodash'
import React, { FC } from 'react'
import { htmlToReact, markdownify } from '../../utils'
import { FormField } from '../FormField'

export const SectionContact: FC<{ section: section_contact }> = ({ section }) => (
  <section id={section.section_id} className={'block contact-block bg-' + section.background + ' outer'}>
    <div className="block-header inner-small">
      {section.title && <h2 className="block-title">{section.title}</h2>}
      {section.subtitle && <p className="block-subtitle">{htmlToReact(section.subtitle)}</p>}
    </div>
    <div className="block-content inner-medium">
      {markdownify(section.content)}
      <form
        name={section.form_id}
        id={section.form_id}
        {...(section.form_action
          ? {
              action: section.form_action,
            }
          : null)}
        method="POST"
        data-netlify="true"
        data-netlify-honeypot={section.form_id + '-bot-field'}
      >
        <div className="screen-reader-text">
          <label id={section.form_id + '-honeypot-label'} htmlFor={section.form_id + '-honeypot'}>
            Don't fill this out if you're human:
          </label>
          <input
            aria-labelledby={section.form_id + '-honeypot-label'}
            id={section.form_id + '-honeypot'}
            name={section.form_id + '-bot-field'}
          />
        </div>
        <input
          aria-labelledby={section.form_id + '-honeypot-label'}
          type="hidden"
          name="form-name"
          value={section.form_id}
        />
        {_.map(section.form_fields, (field, field_idx) => (
          <div key={field_idx} className="form-row">
            <FormField field={field} section={section} />
          </div>
        ))}
        <div className="form-row form-submit">
          <button type="submit" className="button">
            {section.submit_label}
          </button>
        </div>
      </form>
    </div>
  </section>
)
