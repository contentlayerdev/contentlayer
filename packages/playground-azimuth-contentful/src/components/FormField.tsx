import { footer_form, form_field, section_contact } from 'contentlayer/types'
import React, { FC } from 'react'
import { classNames } from '../utils'

export const FormField: FC<{ section: footer_form | section_contact; field: form_field }> = ({ field, section }) => {
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
