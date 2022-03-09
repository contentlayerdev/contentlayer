import type { FC } from 'react'
import React from 'react'

import { Action } from '../Action'
import type * as types from 'contentlayer/generated'

export const FooterNav: FC<{ section: types.FooterNav }> = ({ section }) => (
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
