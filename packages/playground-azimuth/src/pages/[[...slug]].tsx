import React, { FC } from 'react'
// import _ from 'lodash'
// import { sourcebitDataClient } from 'sourcebit-target-next'
// import { withRemoteDataUpdates } from 'sourcebit-target-next/with-remote-data-updates'

// import pageLayouts from '../layouts'
import { SourcebitClient, Document, guards } from '@sourcebit/sdk'
import { defineStaticPaths, defineStaticProps } from '../utils/next'
import { InferGetStaticPropsType } from 'next'
import pageLayouts from '../layouts'
import cache from '../sourcebit.json'

const sourcebit = new SourcebitClient({ cache: cache as any })

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
  const componentName = props.doc!.__meta.typeName
  const PageLayout = (pageLayouts as any)[componentName] as FC
  return <PageLayout {...props} />
}

export default Page

function toParams(path: string): { params: { slug: string[] } } {
  return { params: { slug: path.split('/') } }
}

function urlFromFilePath(doc: Document): string {
  return doc.__meta.sourceFilePath
    .replace('content/pages/', '')
    .replace('.md', '')
}

export const getStaticPaths = defineStaticPaths(async () => {
  const blogPaths = sourcebit
    .getDocumentsOfType({ type: 'post' })
    .map(urlFromFilePath)
    .map(toParams)

  const landingPaths = sourcebit
    .getDocumentsOfType({ type: 'landing' })
    .map(urlFromFilePath)
    .map(toParams)

  const pagePaths = sourcebit
    .getDocumentsOfType({ type: 'page' })
    .map(urlFromFilePath)
    .map(toParams)

  return {
    paths: [...blogPaths, ...landingPaths, ...pagePaths, '/'],
    fallback: false,
  }
})

export const getStaticProps = defineStaticProps(async (context) => {
  // console.log('Page [...slug].js getStaticProps, params: ', params)
  const params = context.params as any
  const slug = params.slug ?? []

  const pagePath = '/' + slug.join('/')
  console.log({ pagePath })

  const docs = sourcebit.getAllDocuments()
  const doc = docs.find((_) =>
    pagePath === '/'
      ? _.__meta.sourceFilePath.includes(`/pages/index`)
      : _.__meta.sourceFilePath.includes(pagePath),
  )
  console.log({ doc })

  // const config = docs.find((_) => _.__meta.typeName === 'config')
  const config = docs.find(guards.config)
  console.log({ config })

  return { props: { doc, config } }

  // documents[0].__meta.urlPath

  // const props = await sourcebitDataClient.getStaticPropsForPageAtPath(pagePath)
  // return { props, revalidate: 60 * 1000 }
})

// export default withRemoteDataUpdates(Page)
