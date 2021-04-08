import { InferGetStaticPropsType } from 'next'
import React, { FC } from 'react'
import { guards, SourcebitClient } from 'sourcebit/client'
import sourcebitConfig from '../../sourcebit/sourcebit'
import { BlogLayout } from '../layouts/BlogLayout'
import { LandingLayout } from '../layouts/LandingLayout'
import { PageLayout } from '../layouts/PageLayout'
import { PostLayout } from '../layouts/PostLayout'
import { defineStaticProps, toParams } from '../utils/next'

const sourcebit = new SourcebitClient({ config: sourcebitConfig })

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ config, doc, posts, persons }) => {
  switch (doc._typeName) {
    case 'landing':
      return <LandingLayout doc={doc} config={config} posts={posts} persons={persons} />
    case 'page':
      return <PageLayout doc={doc} config={config} />
    case 'blog':
      return <BlogLayout doc={doc} config={config} posts={posts} persons={persons} />
    case 'post':
      return <PostLayout doc={doc} config={config} persons={persons} />
  }
}

export default Page

export const getStaticPaths = async () => {
  await sourcebit.fetchData()
  const paths = sourcebit
    .getAllDocuments()
    .filter(guards.is(['post', 'landing', 'page', 'blog']))
    .map((_) => _.url_path)
    .map(toParams)

  return { paths, fallback: false }
}

export const getStaticProps = defineStaticProps(async (context) => {
  await sourcebit.fetchData()

  const params = context.params as any
  const pagePath = `/${params.slug?.join('/') ?? ''}`
  const docs = sourcebit.getAllDocuments()

  const doc = docs.filter(guards.is(['post', 'landing', 'page', 'blog'])).find((_) => _.url_path === pagePath)!
  const posts = docs.filter(guards.is('post'))
  const persons = docs.filter(guards.is('person'))
  const config = docs.find(guards.is('config'))!

  return { props: { doc, config, posts, persons } }
})
