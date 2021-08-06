import type { FC } from 'react'
import React from 'react'

import { SectionContact } from '../components/landing-sections/SectionContact'
import { SectionContent } from '../components/landing-sections/SectionContent'
import { SectionCta } from '../components/landing-sections/SectionCta'
import { SectionFaq } from '../components/landing-sections/SectionFaq'
import { SectionFeatures } from '../components/landing-sections/SectionFeatures'
import { SectionHero } from '../components/landing-sections/SectionHero'
import { SectionPosts } from '../components/landing-sections/SectionPosts'
import { SectionPricing } from '../components/landing-sections/SectionPricing'
import { SectionReviews } from '../components/landing-sections/SectionReviews'
import { Layout } from '../components/Layout'
import type * as types from '.contentlayer/types'

export const LandingLayout: FC<{
  landing: types.Landing
  config: types.Config
  posts: types.Post[]
}> = ({ landing, config, posts }) => (
  <Layout doc={landing} config={config}>
    {landing.sections?.map((section, index) => {
      switch (section.type) {
        case 'SectionContact':
          return <SectionContact key={index} section={section} />
        case 'SectionContent':
          return <SectionContent key={index} section={section} />
        case 'SectionCta':
          return <SectionCta key={index} section={section} />
        case 'SectionFaq':
          return <SectionFaq key={index} section={section} />
        case 'SectionFeatures':
          return <SectionFeatures key={index} section={section} />
        case 'SectionHero':
          return <SectionHero key={index} section={section} />
        case 'SectionPosts':
          return <SectionPosts key={index} section={section} posts={posts} />
        case 'SectionPricing':
          return <SectionPricing key={index} section={section} />
        case 'SectionReviews':
          return <SectionReviews key={index} section={section} />
      }
    })}
  </Layout>
)
