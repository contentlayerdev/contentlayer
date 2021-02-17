import React, { FC } from 'react'
import _ from 'lodash'

import components, { Layout } from '../components/index'

const Landing: FC<{
  doc: SourcebitGen['typeMap']['landing']
  config: SourcebitGen['typeMap']['config']
}> = ({ ...props }) => (
  <Layout {...props}>
    {props.doc.sections.map((section, section_idx) => {
      const componentName = _.upperFirst(_.camelCase(section.type))
      const Component = components[componentName]
      return (
        <Component
          key={section_idx}
          {...props}
          section={section}
          site={props}
        />
      )
    })}
  </Layout>
)

export default Landing
