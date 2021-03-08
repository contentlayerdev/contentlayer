import { site_config } from '@sourcebit/sdk/types'
import React, { FC } from 'react'
import { htmlToReact } from '../utils'
import ActionLink from './ActionLink'
import FooterForm from './FooterForm'
import FooterNav from './FooterNav'
import FooterText from './FooterText'

const footerComponents = {
  footer_form: FooterForm,
  footer_nav: FooterNav,
  footer_text: FooterText,
}

const Footer: FC<{ config: site_config }> = ({ config }) => {
  console.log({ config })

  return (
    <footer id="colophon" className="site-footer">
      {config.footer.sections && config.footer.sections.length > 0 && (
        <div className="footer-top outer">
          <div className="inner">
            <div className="grid footer-widgets">
              {config.footer.sections.map((section, index) => {
                // TODO make `type` type-safe
                const Component = (footerComponents as any)[section.type]
                return <Component key={index} section={section as any} />
              })}
            </div>
          </div>
        </div>
      )}
      <div className="footer-bottom outer">
        <div className="inner">
          {config.footer.has_nav && config.footer.nav_links && (
            <div className="footer-nav">
              <ul className="menu">
                {config.footer.nav_links.map((action, action_idx) => (
                  <li key={action_idx} className="menu-item">
                    <ActionLink action={action} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="site-info">
            {htmlToReact(config.footer.content)}
            &nbsp;
            {config.footer.links?.map((action, action_idx) => (
              <ActionLink key={action_idx} action={action} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
