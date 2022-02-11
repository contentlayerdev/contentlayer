import { defineEmbedded } from 'contentlayer/source-files/schema'
import type { FC } from 'react'
import React from 'react'

import { classNames } from '../utils'
import type * as types from 'contentlayer/generated'

export const FormField: FC<{ section: types.FooterForm | types.SectionContact; field: types.FormField }> = ({
  field,
  section,
}) => {
  return (
    <>
      {field.input_type !== 'checkbox' && field.label && (
        <label
          id={field.name + '-label'}
          htmlFor={field.name}
          className={classNames({
            'screen-reader-text': section.hide_labels,
          })}
        >
          {field.label}
        </label>
      )}
      {field.input_type === 'checkbox' ? (
        <div className="form-checkbox">
          <input
            id={field.name}
            type="checkbox"
            name={field.name}
            aria-labelledby={`${field.name}-label`}
            required={field.is_required}
          />
          {field.label && (
            <label htmlFor={field.name} id={field.name + '-label'}>
              {field.label}
            </label>
          )}
        </div>
      ) : field.input_type === 'select' ? (
        <div className="form-select">
          <select
            id={field.name}
            name={field.name}
            aria-labelledby={`${field.name}-label`}
            required={field.is_required}
          >
            {field.default_value && <option value="">{field.default_value}</option>}
            {field.options?.map((option, option_idx) => (
              <option key={option_idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ) : field.input_type === 'textarea' ? (
        <textarea
          id={field.name}
          name={field.name}
          rows={5}
          aria-labelledby={`${field.name}-label`}
          required={field.is_required}
          placeholder={field.default_value}
        />
      ) : (
        <input
          id={field.name}
          type={field.input_type}
          name={field.name}
          aria-labelledby={`${field.name}-label`}
          required={field.is_required}
          placeholder={field.default_value}
        />
      )}
    </>
  )
}

export const FormFieldModel = defineEmbedded(() => ({
  name: 'FormField',
  label: 'Form Field',
  labelField: 'name',
  fields: {
    input_type: {
      type: 'enum',
      label: 'Type',
      options: ['text', 'textarea', 'email', 'tel', 'number', 'checkbox', 'select'],
      description: 'Type of the form field',
      required: true,
    },
    name: {
      type: 'string',
      label: 'Name',
      description: 'The name of the field, submitted with the form',
      required: true,
    },
    label: {
      type: 'string',
      label: 'Label',
      description: 'The caption of the field, shown above the field input',
    },
    default_value: {
      type: 'string',
      label: 'Placeholder text or default value',
      description: 'The placeholder for textual field types or default option for select field',
    },
    options: {
      type: 'list',
      label: 'Options',
      description: 'The list of options for select field',
      of: { type: 'string' },
    },
    is_required: {
      type: 'boolean',
      label: 'Is the field required?',
      default: false,
    },
  },
}))
