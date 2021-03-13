import { InferGetStaticPropsType } from 'next'
import React, { FC } from 'react'
import { guards, SourcebitClient } from 'sourcebit/client'
import { BlogLayout } from '../layouts/blog'
import { LandingLayout } from '../layouts/landing'
import { PageLayout } from '../layouts/page'
import { PostLayout } from '../layouts/post'
import { defineStaticPaths, defineStaticProps, SourcebitContext, toParams, useContentLiveReload } from '../utils/next'

const cache = require('../sourcebit.json')
const sourcebit = new SourcebitClient({ cache })

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ config, doc, posts }) => {
  if (process.env.NODE_ENV === 'development') {
    useContentLiveReload()
  }

  const pageContent = () => {
    switch (doc._typeName) {
      case 'blog':
        return <BlogLayout doc={doc} config={config} posts={posts!} />
      case 'landing':
        return <LandingLayout doc={doc} config={config} />
      case 'page':
        return <PageLayout doc={doc} config={config} />
      case 'post':
        return <PostLayout doc={doc} config={config} />
    }
  }

  return <SourcebitContext.Provider value={sourcebit}>{pageContent()}</SourcebitContext.Provider>
}

export default Page

export const getStaticPaths = defineStaticPaths(async () => {
  const paths = sourcebit
    .getAllDocuments()
    .filter(guards.is(['post', 'landing', 'page', 'blog']))
    .map((_) => _.url_path)
    .map(toParams)

  return { paths, fallback: false }
})

export const getStaticProps = defineStaticProps(async (context) => {
  const params = context.params as any
  const pagePath = `/${params.slug?.join('/') ?? ''}`
  const docs = sourcebit.getAllDocuments()

  const doc = docs.filter(guards.is(['post', 'landing', 'page', 'blog'])).find((_) => _.url_path === pagePath)!

  const config = docs.find(guards.is('config'))!

  if (pagePath.startsWith('/blog')) {
    const posts = docs.filter(guards.is('post'))

    return { props: { doc, config, posts } }
  } else {
    return { props: { doc, config } }
  }
})
