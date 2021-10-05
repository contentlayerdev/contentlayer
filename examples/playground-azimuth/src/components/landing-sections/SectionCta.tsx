import type { FC } from 'react'
import React from 'react'

import { htmlToReact } from '../../utils'
import { CtaButtons } from './CtaButtons'
import type * as types from '.contentlayer/types'

export const SectionCta: FC<{ section: types.SectionCta }> = ({ section }) => (
  <section id={section.section_id} className="block cta-block bg-accent outer">
    <div className="inner-large">
      <div className="grid">
        <div className="cell block-content">
          {section.title && <h2 className="block-title">{section.title}</h2>}
          {section.subtitle && <p className="block-copy">{htmlToReact(section.subtitle)}</p>}
        </div>
        {section.actions && (
          <div className="cell block-buttons">
            <CtaButtons actions={section.actions} />
          </div>
        )}
      </div>
    </div>
  </section>
)
