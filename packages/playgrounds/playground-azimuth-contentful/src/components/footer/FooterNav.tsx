import { footer_nav } from 'contentlayer/types'
import React, { FC } from 'react'
import { Action } from '../Action'

export const FooterNav: FC<{ section: footer_nav }> = ({ section }) => (
  <section className="cell widget widget-nav">
    {section.title && <h2 className="widget-title">{section.title}</h2>}
    {section.nav_links && (
      <ul className="menu">
        {section.nav_links.map((action, action_idx) => (
          <li key={action_idx} className="menu-item">
            <Action action={action} />
          </li>
        ))}
      </ul>
    )}
  </section>
)
