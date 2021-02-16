import React from 'react';
import _ from 'lodash';

import {Link, withPrefix} from '../utils';

export default class ActionLink extends React.Component {
    render() {
        let action = _.get(this.props, 'action', null);
        return (
            <Link href={withPrefix(_.get(action, 'url', null))}
              {...(_.get(action, 'new_window', null) ? ({target: '_blank'}) : null)}
              {...((_.get(action, 'new_window', null) || _.get(action, 'no_follow', null)) ? ({rel: (_.get(action, 'new_window', null) ? ('noopener ') : '') + (_.get(action, 'no_follow', null) ? ('nofollow') : '')}) : null)}>{_.get(action, 'label', null)}</Link>
        );
    }
}
