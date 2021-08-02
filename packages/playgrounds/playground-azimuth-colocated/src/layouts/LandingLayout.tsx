import { defineDocument } from 'contentlayer/source-local/schema'
import type { FC } from 'react'
import React from 'react'

import { SectionContact, SectionContactModel } from '../components/landing-sections/SectionContact'
import { SectionContent, SectionContentModel } from '../components/landing-sections/SectionContent'
import { SectionCta, SectionCtaModel } from '../components/landing-sections/SectionCta'
import { SectionFaq, SectionFaqModel } from '../components/landing-sections/SectionFaq'
import { SectionFeatures, SectionFeaturesModel } from '../components/landing-sections/SectionFeatures'
import { SectionHero, SectionHeroModel } from '../components/landing-sections/SectionHero'
import { SectionPosts, SectionPostsModel } from '../components/landing-sections/SectionPosts'
import { SectionPricing, SectionPricingModel } from '../components/landing-sections/SectionPricing'
import { SectionReviews, SectionReviewsModel } from '../components/landing-sections/SectionReviews'
import { Layout } from '../components/Layout'
import { SEOModel } from '../contentlayer/objects/SEO'
import { urlFromFilePath } from '../utils/contentlayer'
import type * as types from '.contentlayer/types'

export const LandingLayout: FC<{
  landing: types.Landing
  config: types.Config
  posts: types.Post[]
}> = ({ landing, config, posts }) => (
  <Layout doc={landing} config={config}>
    {landing.sections?.map((section, index) => {
      switch (section._typeName) {
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

export const LandingModel = defineDocument(() => ({
  name: 'Landing',
  label: 'Landing Page',
  filePathPattern: 'pages/{contact,features,index,pricing}.md',
  fields: {
    title: {
      type: 'string',
      label: 'Title',
      description: 'The title of the page',
      required: true,
    },
    sections: {
      type: 'list_polymorphic',
      label: 'Sections',
      description: 'Page sections',
      of: [
        { type: 'object', labelField: 'title', object: SectionContentModel },
        { type: 'object', labelField: 'title', object: SectionCtaModel },
        { type: 'object', labelField: 'title', object: SectionFaqModel },
        { type: 'object', labelField: 'title', object: SectionFeaturesModel },
        { type: 'object', labelField: 'title', object: SectionHeroModel },
        { type: 'object', labelField: 'title', object: SectionPostsModel },
        { type: 'object', labelField: 'title', object: SectionPricingModel },
        { type: 'object', labelField: 'title', object: SectionReviewsModel },
        { type: 'object', labelField: 'title', object: SectionContactModel },
      ],
      typeField: 'type',
    },
    seo: {
      type: 'object',
      object: SEOModel,
    },
  },
  computedFields: {
    url_path: {
      type: 'string',
      description:
        'The URL path of this page relative to site root. For example, the site root page would be "/", and post page would be "posts/new-post/"',
      resolve: urlFromFilePath,
    },
  },
}))
