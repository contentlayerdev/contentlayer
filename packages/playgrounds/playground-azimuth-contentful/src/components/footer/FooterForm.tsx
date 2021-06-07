import { footer_form } from 'contentlayer/types'
import React, { FC } from 'react'
import { markdownify } from '../../utils'
import { FormField } from '../FormField'

export const FooterForm: FC<{ section: footer_form }> = ({ section }) => (
  <section className="cell widget widget-form">
    {section.title && <h2 className="widget-title">{section.title}</h2>}
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
      {section.form_fields?.map((field, field_idx) => (
        <div key={field_idx} className="form-row">
          <FormField field={field} section={section} />
        </div>
      ))}
      <div className="form-row">
        <button type="submit" className="button">
          {section.submit_label}
        </button>
      </div>
    </form>
  </section>
)
