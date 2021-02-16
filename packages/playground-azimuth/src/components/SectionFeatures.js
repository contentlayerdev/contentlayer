import React from 'react';
import _ from 'lodash';

import {htmlToReact, withPrefix, markdownify} from '../utils';
import CtaButtons from './CtaButtons';

export default class SectionFeatures extends React.Component {
    render() {
        let section = _.get(this.props, 'section', null);
        return (
            <section id={_.get(section, 'section_id', null)} className={'block features-block bg-' + _.get(section, 'background', null) + ' outer'}>
              <div className="block-header inner-small">
                {_.get(section, 'title', null) && (
                <h2 className="block-title">{_.get(section, 'title', null)}</h2>
                )}
                {_.get(section, 'subtitle', null) && (
                <p className="block-subtitle">
                  {htmlToReact(_.get(section, 'subtitle', null))}
                </p>
                )}
              </div>
              {_.get(section, 'features', null) && (
              <div className="inner">
                {_.map(_.get(section, 'features', null), (feature, feature_idx) => (
                <div key={feature_idx} className="block-item">
                  <div className="grid">
                    {_.get(feature, 'image', null) && (
                    <div className="cell block-preview">
                      <img src={withPrefix(_.get(feature, 'image', null))} alt={_.get(feature, 'image_alt', null)} />
                    </div>
                    )}
                    <div className="cell block-content">
                      <h3 className="block-title underline">{_.get(feature, 'title', null)}</h3>
                      <div className="block-copy">
                        {markdownify(_.get(feature, 'content', null))}
                      </div>
                      {_.get(feature, 'actions', null) && (
                      <div className="block-buttons">
                        <CtaButtons {...this.props} actions={_.get(feature, 'actions', null)} />
                      </div>
                      )}
                    </div>
                  </div>
                </div>
                ))}
                </div>
              )}
            </section>
        );
    }
}
