import { config, landing, post } from 'contentlayer/types'
import React, { FC } from 'react'
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

export const LandingLayout: FC<{
  doc: landing
  config: config
  posts: post[]
}> = ({ doc, config, posts }) => (
  <Layout doc={doc} config={config}>
    {doc.sections?.map((section, index) => {
      switch (section._typeName) {
        case 'section_contact':
          return <SectionContact key={index} section={section} />
        case 'section_content':
          return <SectionContent key={index} section={section} />
        case 'section_cta':
          return <SectionCta key={index} section={section} />
        case 'section_faq':
          return <SectionFaq key={index} section={section} />
        case 'section_features':
          return <SectionFeatures key={index} section={section} />
        case 'section_hero':
          return <SectionHero key={index} section={section} />
        case 'section_posts':
          return <SectionPosts key={index} section={section} posts={posts} />
        case 'section_pricing':
          return <SectionPricing key={index} section={section} />
        case 'section_reviews':
          return <SectionReviews key={index} section={section} />
      }
    })}
  </Layout>
)
