import React from 'react';
import _ from 'lodash';

import Action from './Action';

export default class FooterNav extends React.Component {
    render() {
        let section = _.get(this.props, 'section', null);
        return (
            <section className="cell widget widget-nav">
              {_.get(section, 'title', null) && (
              <h2 className="widget-title">{_.get(section, 'title', null)}</h2>
              )}
              {_.get(section, 'nav_links', null) && (
              <ul className="menu">
                {_.map(_.get(section, 'nav_links', null), (action, action_idx) => (
                <li key={action_idx} className="menu-item">
                  <Action {...this.props} action={action} />
                </li>
                ))}
              </ul>
              )}
            </section>
        );
    }
}
