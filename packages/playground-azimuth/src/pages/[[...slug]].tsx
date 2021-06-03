import type { InferGetStaticPropsType } from 'next'
import type { FC } from 'react'
import React from 'react'

import { BlogLayout } from '../layouts/BlogLayout'
import { LandingLayout } from '../layouts/LandingLayout'
import { PageLayout } from '../layouts/PageLayout'
import { PostLayout } from '../layouts/PostLayout'
import { defineStaticProps, toParams } from '../utils/next'
import { allconfig, allDocuments, allpost, isType } from '.contentlayer'

export const getStaticPaths = async () => {
  const paths = allDocuments
    .filter(isType(['post', 'landing', 'page', 'blog']))
    .map((_) => _.url_path)
    .map(toParams)

  return { paths, fallback: false }
}

export const getStaticProps = defineStaticProps(async (context) => {
  const params = context.params as any
  const pagePath = `/${params.slug?.join('/') ?? ''}`

  const doc = allDocuments.filter(isType(['post', 'landing', 'page', 'blog'])).find((_) => _.url_path === pagePath)!
  const posts = allpost
  const config = allconfig[0]

  return { props: { doc, config, posts } }
})

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ doc, config, posts }) => {
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
}

export default Page
