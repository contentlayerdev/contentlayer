import React from 'react';
import _ from 'lodash';

import components from './index';
import ActionLink from './ActionLink';
import {htmlToReact} from '../utils';

export default class Footer extends React.Component {
    render() {
        return (
            <footer id="colophon" className="site-footer">
              {_.get(this.props, 'data.config.footer.sections', null) && (
                (_.size(_.get(this.props, 'data.config.footer.sections', null)) > 0) && (
                <div className="footer-top outer">
                  <div className="inner">
                    <div className="grid footer-widgets">
                      {_.map(_.get(this.props, 'data.config.footer.sections', null), (section, section_idx) => {
                          let component = _.upperFirst(_.camelCase(_.get(section, 'type', null)));
                          let Component = components[component];
                          return (
                            <Component key={section_idx} {...this.props} section={section} site={this.props} />
                          )
                      })}
                    </div>
                  </div>
                </div>
                )
              )}
              <div className="footer-bottom outer">
                <div className="inner">
                  {(_.get(this.props, 'data.config.footer.has_nav', null) && _.get(this.props, 'data.config.footer.nav_links', null)) && (
                  <div className="footer-nav">
                    <ul className="menu">
                      {_.map(_.get(this.props, 'data.config.footer.nav_links', null), (action, action_idx) => (
                      <li key={action_idx} className="menu-item"> 
                        <ActionLink {...this.props} action={action} />
                      </li>
                      ))}
                    </ul>
                  </div>
                  )}
                  <div className="site-info">
                    {htmlToReact(_.get(this.props, 'data.config.footer.content', null))}
                    &nbsp;
                    {_.map(_.get(this.props, 'data.config.footer.links', null), (action, action_idx) => (
                      <ActionLink key={action_idx} {...this.props} action={action} />
                    ))}
                  </div>
                </div>
              </div>
            </footer>
        );
    }
}
