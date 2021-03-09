import { guards, SourcebitClient } from '@sourcebit/client'
import { InferGetStaticPropsType } from 'next'
import React, { FC } from 'react'
import pageLayouts from '../layouts'
import { defineStaticPaths, defineStaticProps, SourcebitContext, toParams, useContentLiveReload } from '../utils/next'

const cache = require('../sourcebit.json')
const sourcebit = new SourcebitClient({ cache })

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
  const componentName = props.doc!.__meta.typeName
  const PageLayout = (pageLayouts as any)[componentName] as FC
  if (process.env.NODE_ENV === 'development') {
    useContentLiveReload()
  }
  return (
    <SourcebitContext.Provider value={sourcebit}>
      <PageLayout {...props} />
    </SourcebitContext.Provider>
  )
}

// export default withRemoteDataUpdates(Page)
export default Page

export const getStaticPaths = defineStaticPaths(async () => {
  const paths = sourcebit
    .getAllDocuments()
    .filter(guards.is(['post', 'landing', 'page', 'blog']))
    .map((_) => _.__computed.urlPath)
    .map(toParams)

  return { paths, fallback: false }
})

export const getStaticProps = defineStaticProps(async (context) => {
  const params = context.params as any
  const pagePath = params.slug?.join('/') ?? '/'
  const docs = sourcebit.getAllDocuments()

  const doc = docs
    .filter(guards.is(['post', 'landing', 'page', 'blog']))
    .find((_) => _.__computed.urlPath === pagePath)!

  const config = docs.find(guards.is('site_config'))!

  if (pagePath.startsWith('blog')) {
    const posts = docs.filter(guards.is('post'))

    return { props: { doc, config, posts } }
  } else {
    return { props: { doc, config } }
  }
})
