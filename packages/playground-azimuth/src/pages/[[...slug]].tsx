// import _ from 'lodash'
// import { sourcebitDataClient } from 'sourcebit-target-next'
// import { withRemoteDataUpdates } from 'sourcebit-target-next/with-remote-data-updates'
// import pageLayouts from '../layouts'
import { guards, SourcebitClient } from '@sourcebit/sdk'
import { InferGetStaticPropsType } from 'next'
import React, { FC } from 'react'
import pageLayouts from '../layouts'
import { defineStaticPaths, defineStaticProps, SourcebitContext, toParams } from '../utils/next'

const cache = require('../sourcebit.json')
const sourcebit = new SourcebitClient({ cache })

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
  const componentName = props.doc!.__meta.typeName
  const PageLayout = (pageLayouts as any)[componentName] as FC
  return (
    <SourcebitContext.Provider value={sourcebit}>
      {' '}
      <PageLayout {...props} />
    </SourcebitContext.Provider>
  )
}

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
    .find((_) => _.__computed?.urlPath === pagePath)!
  const config = docs.find(guards.isType.config)!

  if (pagePath.startsWith('blog')) {
    const posts = docs.filter(guards.is('post'))

    return { props: { doc, config, posts } }
  } else {
    return { props: { doc, config } }
  }
})

// export default withRemoteDataUpdates(Page)
