import { defineEmbedded } from 'contentlayer/source-local/schema'
import type { FC } from 'react'
import React from 'react'

import { htmlToReact, markdownify, withPrefix } from '../../utils'
import { ActionModel } from '../Action'
import { CtaButtons } from './CtaButtons'
import { sectionBaseFields } from './model'
import type * as types from '.contentlayer/types'

export const SectionFeatures: FC<{ section: types.SectionFeatures }> = ({ section, ...props }) => {
  return (
    <section id={section.section_id} className={'block features-block bg-' + section.background + ' outer'}>
      <div className="block-header inner-small">
        {section.title && <h2 className="block-title">{section.title}</h2>}
        {section.subtitle && <p className="block-subtitle">{htmlToReact(section.subtitle)}</p>}
      </div>
      {section.features && (
        <div className="inner">
          {section.features.map((feature, feature_idx) => (
            <div key={feature_idx} className="block-item">
              <div className="grid">
                {feature.image && (
                  <div className="cell block-preview">
                    <img src={withPrefix(feature.image)} alt={feature.image_alt} />
                  </div>
                )}
                <div className="cell block-content">
                  <h3 className="block-title underline">{feature.title}</h3>
                  <div className="block-copy">{markdownify(feature.content)}</div>
                  {feature.actions && (
                    <div className="block-buttons">
                      <CtaButtons {...props} actions={feature.actions} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export const SectionFeaturesModel = defineEmbedded(() => ({
  name: 'SectionFeatures',
  label: 'Features Section',
  labelField: 'title',
  fields: {
    ...sectionBaseFields,
    subtitle: {
      type: 'string',
      label: 'Subtitle',
      description: 'The subtitle of the section',
    },
    background: {
      type: 'enum',
      label: 'Background',
      description: 'The background of the section',
      options: ['gray', 'white'],
      default: 'gray',
    },
    features: {
      type: 'list',
      label: 'Features',
      of: { type: 'object', object: FeatureItem },
    },
  },
}))

const FeatureItem = defineEmbedded(() => ({
  name: 'FeatureItem',
  label: 'Feature Item',
  labelField: 'title',
  fields: {
    title: {
      type: 'string',
      label: 'Title',
    },
    content: {
      type: 'markdown',
      label: 'Content',
      description: 'Feature description',
    },
    image: {
      type: 'image',
      label: 'Image',
      description: 'Feature image',
    },
    image_alt: {
      type: 'string',
      label: 'Image Alt Text',
      description: 'The alt text of the feature image',
    },
    actions: {
      type: 'list',
      label: 'Action Buttons',
      of: { type: 'object', object: ActionModel },
    },
  },
}))
