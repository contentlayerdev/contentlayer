import React, { FC } from 'react'
// import _ from 'lodash'
// import { sourcebitDataClient } from 'sourcebit-target-next'
// import { withRemoteDataUpdates } from 'sourcebit-target-next/with-remote-data-updates'

// import pageLayouts from '../layouts'
import { SourcebitClient } from '@sourcebit/sdk'
import { defineStaticPaths, defineStaticProps } from '../utils/next'
import { InferGetStaticPropsType } from 'next'
import pageLayouts from '../layouts'

const cache = require('../sourcebit.json')
const sourcebit = new SourcebitClient({ cache })

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
  const componentName = props.doc!.__meta.typeName
  const PageLayout = (pageLayouts as any)[componentName] as FC
  return (
    <div>
      Hello <PageLayout {...props} />
    </div>
  )
}
// class Page extends React.Component {
//   render() {
//     // every page can have different layout, pick the layout based
//     // on the model of the page (_type in Sanity CMS)
//     const componentName = _.get(this.props, 'page.__metadata.modelName')
//     const PageLayout = pageLayouts[componentName]
//     return <PageLayout {...this.props} />
//   }
// }

export default Page

export const getStaticPaths = defineStaticPaths(async () => {
  console.log('Page [...slug].js getStaticPaths')
  // filter out the root page as it has its own page file `src/pages/index.js`
  // const paths = await sourcebitDataClient.getStaticPaths()

  // const pagePath = '/' + params.slug.join('/')
  const blogs = sourcebit.getDocumentsOfType({ type: 'post' })
  const blogPaths = blogs
    .map((_) =>
      _.__meta.sourceFilePath.replace('content/pages/', '').replace('.md', ''),
    )
    .map((_) => ({ params: { slug: _.split('/') } }))

  console.log('paths', JSON.stringify(blogPaths, null, 2))

  // const pages = sourcebit.getDocumentsOfType({ type: 'Page' })
  return { paths: [...blogPaths], fallback: false }
})

export const getStaticProps = defineStaticProps(async (context) => {
  // console.log('Page [...slug].js getStaticProps, params: ', params)
  const params = context.params as any

  const pagePath = '/' + params.slug.join('/')
  console.log({ pagePath })

  const docs = sourcebit.getAllDocuments()
  const doc = docs.find((_) => _.__meta.sourceFilePath.includes(pagePath))
  console.log({ doc })

  return { props: { doc } }

  // documents[0].__meta.urlPath

  // const props = await sourcebitDataClient.getStaticPropsForPageAtPath(pagePath)
  // return { props, revalidate: 60 * 1000 }
})

// export default withRemoteDataUpdates(Page)
