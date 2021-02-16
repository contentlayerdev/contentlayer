import React from 'react';
import _ from 'lodash';

import Action from './Action';

export default class CtaButtons extends React.Component {
    render() {
        let actions = _.get(this.props, 'actions', null);
        return (
            _.map(actions, (action, action_idx) => (
              <Action key={action_idx} {...this.props} action={action} />
            ))
        );
    }
}
