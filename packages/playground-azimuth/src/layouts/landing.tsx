import { config, landing } from '@sourcebit/types'
import _ from 'lodash'
import React, { FC } from 'react'
import components, { Layout } from '../components/index'

const Landing: FC<{
  doc: landing
  config: config
}> = ({ doc, config }) => (
  <Layout doc={doc} config={config}>
    {doc.sections?.map((section, section_idx) => {
      const Component = getComponentBySection(section)
      return <Component key={section_idx} section={section} />
    })}
  </Layout>
)

export default Landing

// type Section = section_hero | section_cta | section_content | section_features
type Section = any
function getComponentBySection(section: Section): FC<{ section: Section }> {
  const componentName = _.upperFirst(_.camelCase(section.type))
  return (components as any)[componentName]
}
