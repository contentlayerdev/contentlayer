import { defineObject } from 'contentlayer/source-local/schema'
import _ from 'lodash'
import type { FC } from 'react'
import React from 'react'

import { htmlToReact, markdownify } from '../../utils'
import { FormField, FormFieldModel } from '../FormField'
import { sectionBaseFields } from './model'
import type * as types from '.contentlayer/types'

export const SectionContact: FC<{ section: types.SectionContact }> = ({ section }) => (
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

export const SectionContactModel = defineObject(() => ({
  name: 'SectionContact',
  label: 'Contact Section',
  labelField: 'title',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      label: 'Subtitle',
      description: 'The text shown below the title',
    },
    content: {
      type: 'markdown',
      label: 'Content',
      description: 'the content of the section, appears above the form',
    },
    background: {
      type: 'enum',
      label: 'Background',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    form_id: {
      type: 'string',
      label: 'Form ID',
      description: 'A unique identifier of the form, must not contain whitespace',
      required: true,
    },
    form_action: {
      type: 'string',
      label: 'Form Action',
      description: 'The path of your custom "success" page, if you want to replace the default success message.',
    },
    hide_labels: {
      type: 'boolean',
      label: 'Hide labels of the form fields?',
      default: false,
    },
    form_fields: {
      type: 'list',
      label: 'Form Fields',
      of: { type: 'object', object: FormFieldModel },
    },
    submit_label: {
      type: 'string',
      label: 'Submit Button Label',
      required: true,
    },
  },
}))
