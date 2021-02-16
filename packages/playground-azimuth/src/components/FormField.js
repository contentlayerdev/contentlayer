import React from 'react';
import _ from 'lodash';

import {classNames} from '../utils';

export default class FormField extends React.Component {
    render() {
        let section = _.get(this.props, 'section', null);
        let field = _.get(this.props, 'field', null);
        return (
            <React.Fragment>
                {(_.get(field, 'input_type', null) !== 'checkbox') && (
                  _.get(field, 'label', null) && (
                  <label id={_.get(field, 'name', null) + '-label'} htmlFor={_.get(field, 'name', null)} className={classNames({'screen-reader-text': _.get(section, 'hide_labels', null)})}>{_.get(field, 'label', null)}</label>
                  )
                )}
                {(_.get(field, 'input_type', null) === 'checkbox') ? (
                <div className="form-checkbox">
                  <input id={_.get(field, 'name', null)} type="checkbox" name={_.get(field, 'name', null)}{...(_.get(field, 'label', null) ? ({"aria-labelledby": _.get(field, 'name', null) + '-label'}) : null)}{...(_.get(field, 'is_required', null) ? ({required: true}) : null)}/>
                  {_.get(field, 'label', null) && (
                  <label htmlFor={_.get(field, 'name', null)} id={_.get(field, 'name', null) + '-label'}>{_.get(field, 'label', null)}</label>
                  )}
                </div>
                ) : ((_.get(field, 'input_type', null) === 'select') ? (
                <div className="form-select">
                  <select id={_.get(field, 'name', null)} name={_.get(field, 'name', null)}{...(_.get(field, 'label', null) ? ({"aria-labelledby": _.get(field, 'name', null) + '-label'}) : null)}{...(_.get(field, 'is_required', null) ? ({required: true}) : null)}>
                    {_.get(field, 'default_value', null) && (
                    <option value="">{_.get(field, 'default_value', null)}</option>
                    )}
                    {_.map(_.get(field, 'options', null), (option, option_idx) => (
                      <option key={option_idx} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                ) : ((_.get(field, 'input_type', null) === 'textarea') ? (
                <textarea id={_.get(field, 'name', null)} name={_.get(field, 'name', null)} rows="5"{...(_.get(field, 'label', null) ? ({"aria-labelledby": _.get(field, 'name', null) + '-label'}) : null)}{...(_.get(field, 'default_value', null) ? ({placeholder: _.get(field, 'default_value', null)}) : null)}{...(_.get(field, 'is_required', null) ? ({required: true}) : null)}/>
                ) : 
                <input id={_.get(field, 'name', null)} type={_.get(field, 'input_type', null)} name={_.get(field, 'name', null)} {...(_.get(field, 'label', null) ? ({"aria-labelledby": _.get(field, 'name', null) + '-label'}) : null)}{...(_.get(field, 'default_value', null) ? ({placeholder: _.get(field, 'default_value', null)}) : null)}{...(_.get(field, 'is_required', null) ? ({required: true}) : null)} />
                ))}
            </React.Fragment>
        );
    }
}
