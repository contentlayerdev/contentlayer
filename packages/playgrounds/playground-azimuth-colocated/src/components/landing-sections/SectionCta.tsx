import { defineEmbedded } from 'contentlayer/source-local/schema'
import type { FC } from 'react'
import React from 'react'

import { htmlToReact } from '../../utils'
import { ActionModel } from '../Action'
import { CtaButtons } from './CtaButtons'
import { sectionBaseFields } from './model'
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

export const SectionCtaModel = defineEmbedded(() => ({
  name: 'SectionCta',
  label: 'Call to Action Section',
  labelField: 'title',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      label: 'Subtitle',
      description: 'The subtitle of the section',
    },
    actions: {
      type: 'list',
      label: 'Action Buttons',
      of: { type: 'object', object: ActionModel },
    },
  },
}))
