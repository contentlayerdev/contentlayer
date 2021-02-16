import React from 'react';
import _ from 'lodash';

import {Link, withPrefix, classNames} from '../utils';
import Icon from './Icon';

export default class Action extends React.Component {
    render() {
        let action = _.get(this.props, 'action', null);
        let action_style = _.get(action, 'style', null) || 'link';
        let action_icon = _.get(action, 'icon', null) || 'arrow-left';
        let action_icon_pos = _.get(action, 'icon_position', null) || 'left';
        return (
            <Link href={withPrefix(_.get(action, 'url', null))}
              {...(_.get(action, 'new_window', null) ? ({target: '_blank'}) : null)}
              {...((_.get(action, 'new_window', null) || _.get(action, 'no_follow', null)) ? ({rel: (_.get(action, 'new_window', null) ? ('noopener ') : '') + (_.get(action, 'no_follow', null) ? ('nofollow') : '')}) : null)}
              className={classNames({'button': (action_style === 'primary') || (action_style === 'secondary'), 'secondary': action_style === 'secondary', 'has-icon': _.get(action, 'has_icon', null)})}>
              {_.get(action, 'has_icon', null) && (
                <Icon {...this.props} icon={action_icon} />
              )}
              <span className={classNames({'order-first': action_icon_pos === 'right'})}>{_.get(action, 'label', null)}</span>
            </Link>
        );
    }
}
