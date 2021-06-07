import { ContentlayerClient, isType } from 'contentlayer/client'
import { ContentlayerContext } from 'contentlayer/react'
import { InferGetStaticPropsType } from 'next'
import React, { FC } from 'react'
import { BlogLayout } from '../layouts/BlogLayout'
import { LandingLayout } from '../layouts/LandingLayout'
import { PageLayout } from '../layouts/PageLayout'
import { PostLayout } from '../layouts/PostLayout'
import { defineStaticProps, toParams } from '../utils/next'

export const getStaticPaths = async () => {
  const contentlayer = new ContentlayerClient()
  const paths = contentlayer
    .getAllDocuments()
    .filter(isType(['post', 'landing', 'page', 'blog']))
    .map((_) => _.url_path)
    .map(toParams)

  return { paths, fallback: false }
}

export const getStaticProps = defineStaticProps(async (context) => {
  const params = context.params as any
  const pagePath = `/${params.slug?.join('/') ?? ''}`

  const contentlayer = new ContentlayerClient()
  const docs = contentlayer.getAllDocuments()
  const doc = docs.filter(isType(['post', 'landing', 'page', 'blog'])).find((_) => _.url_path === pagePath)!
  const posts = docs.filter(isType('post'))
  const config = docs.find(isType('config'))!

  return { props: { docs, doc, config, posts } }
})

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ docs, doc, config, posts }) => (
  <ContentlayerContext.Provider value={docs}>
    {(() => {
      switch (doc._typeName) {
        case 'landing':
          return <LandingLayout doc={doc} config={config} posts={posts} />
        case 'page':
          return <PageLayout doc={doc} config={config} />
        case 'blog':
          return <BlogLayout doc={doc} config={config} posts={posts} />
        case 'post':
          return <PostLayout doc={doc} config={config} />
      }
    })()}
  </ContentlayerContext.Provider>
)

export default Page
