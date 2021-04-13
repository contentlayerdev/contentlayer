import { section_features } from 'contentlayer/types'
import React, { FC } from 'react'
import { htmlToReact, markdownify, withPrefix } from '../../utils'
import { CtaButtons } from './CtaButtons'

export const SectionFeatures: FC<{ section: section_features }> = ({ section, ...props }) => {
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
