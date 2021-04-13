import { isType } from 'contentlayer/client'
import { blog, config, landing, page, post } from 'contentlayer/types'
import React, { FC } from 'react'
import { classNames, Link, withPrefix } from '../utils'
import { Action } from './Action'

export const Header: FC<{
  config: config
  page: blog | page | landing | post
}> = ({ config, page }) => (
  <header id="masthead" className="site-header outer">
    <div className="inner">
      <div className="site-header-inside">
        <div className="site-branding">
          {config.header.logo_img && (
            <p className="site-logo">
              <Link href={withPrefix('/')}>
                <img src={withPrefix(config.header.logo_img)} alt={config.header.logo_img_alt} />
              </Link>
            </p>
          )}
          {isType(['page', 'post'], page) ? (
            <h1
              className={classNames('site-title', {
                'screen-reader-text': config.header.logo_img,
              })}
            >
              <Link href={withPrefix('/')}>{config.title}</Link>
            </h1>
          ) : (
            <p
              className={classNames('site-title', {
                'screen-reader-text': config.header.logo_img,
              })}
            >
              <Link href={withPrefix('/')}>{config.title}</Link>
            </p>
          )}
        </div>
        {config.header.nav_links && config.header.has_nav && (
          <>
            <nav id="main-navigation" className="site-navigation" aria-label="Main Navigation">
              <div className="site-nav-inside">
                <button id="menu-close" className="menu-toggle">
                  <span className="screen-reader-text">Open Menu</span>
                  <span className="icon-close" aria-hidden="true" />
                </button>
                <ul className="menu">
                  {config.header.nav_links.map((action, action_idx) => {
                    let page_url = 'TODO URL path'
                    let action_url = action.url.trim() ?? '/'
                    let action_style = action.style ?? 'link'
                    return (
                      <li
                        key={action_idx}
                        className={classNames('menu-item', {
                          'current-menu-item': page_url === action_url,
                          'menu-button': action_style !== 'link',
                        })}
                      >
                        <Action action={action} />
                      </li>
                    )
                  })}
                </ul>
              </div>
            </nav>
            <button id="menu-open" className="menu-toggle">
              <span className="screen-reader-text">Close Menu</span>
              <span className="icon-menu" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  </header>
)
