import Head from 'next/head'
import type { FC } from 'react'

import { allDocuments } from '.contentlayer/data'
import type { DocumentTypes } from '.contentlayer/types'

export const getStaticPaths = () => {
  const paths = allDocuments.map((_) => `/${_._id.replace(/\.md$/, '')}`)

  return { paths, fallback: false }
}

export const getStaticProps = (context: any) => {
  const doc = allDocuments.find((_) => _._id.replace(/\.md$/, '') === context.params.id.join('/'))

  return { props: { doc } }
}

const Page: FC<{ doc: DocumentTypes }> = ({ doc }) => (
  <>
    <Head>
      <title>{doc.title}</title>
    </Head>
    <div dangerouslySetInnerHTML={{ __html: doc.content?.html ?? '' }} />
  </>
)

export default Page
