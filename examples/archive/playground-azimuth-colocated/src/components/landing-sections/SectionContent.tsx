import { defineEmbedded } from 'contentlayer/source-files/schema'
import type { FC } from 'react'
import React from 'react'

import { markdownify, withPrefix } from '../../utils'
import { ActionModel } from '../Action'
import { CtaButtons } from './CtaButtons'
import { sectionBaseFields } from './model'
import type * as types from 'contentlayer/generated'

export const SectionContent: FC<{ section: types.SectionContent }> = ({ section }) => (
  <section id={section.section_id} className={'block text-block bg-' + section.background + ' outer'}>
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

export const SectionContentModel = defineEmbedded(() => ({
  name: 'SectionContent',
  label: 'Content Section',
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
    background: {
      type: 'enum',
      label: 'Background',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    actions: {
      type: 'list',
      label: 'Action Buttons',
      of: { type: 'object', object: ActionModel },
    },
  },
}))
