import React from 'react';
import _ from 'lodash';

import components, {Layout} from '../components/index';

export default class Landing extends React.Component {
    render() {
        return (
            <Layout {...this.props}>
            {_.map(_.get(this.props, 'page.frontmatter.sections', null), (section, section_idx) => {
                let component = _.upperFirst(_.camelCase(_.get(section, 'type', null)));
                let Component = components[component];
                return (
                  <Component key={section_idx} {...this.props} section={section} site={this.props} />
                )
            })}
            </Layout>
        );
    }
}
