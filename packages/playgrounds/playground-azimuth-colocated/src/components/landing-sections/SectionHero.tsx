import { defineEmbedded } from 'contentlayer/source-local/schema'
import type { FC } from 'react'
import React from 'react'

import { markdownify, withPrefix } from '../../utils'
import { ActionModel } from '../Action'
import { CtaButtons } from './CtaButtons'
import { sectionBaseFields } from './model'
import type * as types from '.contentlayer/types'

export const SectionHero: FC<{ section: types.SectionHero }> = ({ section }) => {
  return (
    <section id={section.section_id} className="block hero-block bg-accent outer">
      <div className="inner">
        <div className="grid">
          {section.image && (
            <div className="cell block-preview">
              <img src={withPrefix(section.image)} alt={section.image_alt} />
            </div>
          )}
          <div className="cell block-content">
            {section.title && <h2 className="block-title underline">{section.title}</h2>}
            <div className="block-copy">{markdownify(section.content)}</div>
            {section.actions && (
              <div className="block-buttons">
                <CtaButtons actions={section.actions} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export const SectionHeroModel = defineEmbedded(() => ({
  name: 'SectionHero',
  label: 'Hero Section',
  labelField: 'title',
  fields: {
    ...sectionBaseFields,
    content: {
      type: 'markdown',
      label: 'Content',
      description: 'The text content of the section',
    },
    image: {
      type: 'image',
      label: 'Image',
      description: 'The image of the section',
    },
    image_alt: {
      type: 'string',
      label: 'Image Alt Text',
      description: 'The alt text of the section image',
    },
    actions: {
      type: 'list',
      label: 'Action Buttons',
      of: { type: 'object', object: ActionModel },
    },
  },
}))
