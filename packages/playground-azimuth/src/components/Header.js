import React from 'react';
import _ from 'lodash';

import {Link, withPrefix, classNames} from '../utils';
import Action from './Action';

export default class Header extends React.Component {
    render() {
        return (
            <header id="masthead" className="site-header outer">
              <div className="inner">
                <div className="site-header-inside">
                  <div className="site-branding">
                    {_.get(this.props, 'data.config.header.logo_img', null) && (
                    <p className="site-logo"><Link href={withPrefix('/')}><img src={withPrefix(_.get(this.props, 'data.config.header.logo_img', null))} alt={_.get(this.props, 'data.config.header.logo_img_alt', null)} /></Link></p>
                    )}
                    {((_.get(this.props, 'page.frontmatter.template', null) === 'landing') || (_.get(this.props, 'page.frontmatter.template', null) === 'blog')) ? (
                    <h1 className={classNames('site-title', {'screen-reader-text': _.get(this.props, 'data.config.header.logo_img', null)})}><Link href={withPrefix('/')}>{_.get(this.props, 'data.config.title', null)}</Link></h1>
                    ) : 
                    <p className={classNames('site-title', {'screen-reader-text': _.get(this.props, 'data.config.header.logo_img', null)})}><Link href={withPrefix('/')}>{_.get(this.props, 'data.config.title', null)}</Link></p>
                    }
                  </div>
                  {(_.get(this.props, 'data.config.header.nav_links', null) && _.get(this.props, 'data.config.header.has_nav', null)) && (<React.Fragment>
                  <nav id="main-navigation" className="site-navigation" aria-label="Main Navigation">
                    <div className="site-nav-inside">
                      <button id="menu-close" className="menu-toggle"><span className="screen-reader-text">Open Menu</span><span className="icon-close" aria-hidden="true" /></button>
                      <ul className="menu">
                        {_.map(_.get(this.props, 'data.config.header.nav_links', null), (action, action_idx) => {
                            let page_url = _.trim(_.get(this.props, 'page.__metadata.urlPath', null), '/');
                            let action_url = _.trim(_.get(action, 'url', null), '/');
                            let action_style = _.get(action, 'style', null) || 'link';
                            return (
                              <li key={action_idx} className={classNames('menu-item', {'current-menu-item': page_url === action_url, 'menu-button': action_style !== 'link'})}>
                                <Action {...this.props} action={action} />
                              </li>
                            )
                        })}
                      </ul>
                    </div>
                  </nav>
                  <button id="menu-open" className="menu-toggle"><span className="screen-reader-text">Close Menu</span><span className="icon-menu" aria-hidden="true" /></button>
                  </React.Fragment>)}
                </div>
              </div>
            </header>
        );
    }
}
