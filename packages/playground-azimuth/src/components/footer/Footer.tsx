import { config } from 'contentlayer/types'
import React, { FC } from 'react'
import { htmlToReact } from '../../utils'
import { ActionLink } from '../ActionLink'
import { FooterForm } from './FooterForm'
import { FooterNav } from './FooterNav'
import { FooterText } from './FooterText'

export const Footer: FC<{ config: config }> = ({ config }) => (
  <footer id="colophon" className="site-footer">
    {config.footer.sections && config.footer.sections.length > 0 && (
      <div className="footer-top outer">
        <div className="inner">
          <div className="grid footer-widgets">
            {config.footer.sections.map((section, index) => {
              switch (section._typeName) {
                case 'footer_form':
                  return <FooterForm key={index} section={section} />
                case 'footer_nav':
                  return <FooterNav key={index} section={section} />
                case 'footer_text':
                  return <FooterText key={index} section={section} />
              }
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
