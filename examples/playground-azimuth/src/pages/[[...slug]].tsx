import type { InferGetStaticPropsType } from 'next'
import { useLiveReload } from 'next-contentlayer/hooks'
import type { FC } from 'react'
import React from 'react'

import { BlogLayout } from '../layouts/BlogLayout'
import { LandingLayout } from '../layouts/LandingLayout'
import { PageLayout } from '../layouts/PageLayout'
import { PostLayout } from '../layouts/PostLayout'
import { defineStaticProps, toParams } from '../utils/next'
import { allDocuments, allPosts, config } from '.contentlayer/data'
import { isType } from '.contentlayer/types'

export const getStaticPaths = async () => {
  const paths = allDocuments
    .filter(isType(['Post', 'Landing', 'Page', 'Blog']))
    .map((_) => _.url_path)
    .map(toParams)

  return { paths, fallback: false }
}

export const getStaticProps = defineStaticProps(async (context) => {
  const params = context.params as any
  const pagePath = params.slug?.join('/') ?? ''

  const doc = allDocuments.filter(isType(['Post', 'Landing', 'Page', 'Blog'])).find((_) => _.url_path === pagePath)!

  return { props: { doc, config, posts: allPosts } }
})

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ doc, config, posts }) => {
  useLiveReload()

  switch (doc.type) {
    case 'Landing':
      return <LandingLayout landing={doc} config={config} posts={posts} />
    case 'Page':
      return <PageLayout page={doc} config={config} />
    case 'Blog':
      return <BlogLayout blog={doc} config={config} posts={posts} />
    case 'Post':
      return <PostLayout post={doc} config={config} />
  }
}

export default Page
