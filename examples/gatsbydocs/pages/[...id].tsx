import type { DocumentTypes } from 'contentlayer/generated'
import { allDocuments } from 'contentlayer/generated'
import Head from 'next/head'
import type { FC } from 'react'

export const getStaticPaths = () => {
  const paths = allDocuments.map((_) => `/${_._raw.flattenedPath}`)

  return { paths, fallback: false }
}

export const getStaticProps = (context: any) => {
  const doc = allDocuments.find((_) => _._raw.flattenedPath === context.params.id.join('/'))

  return { props: { doc } }
}

const Page: FC<{ doc: DocumentTypes }> = ({ doc }) => (
  <>
    <Head>
      <title>{doc.title}</title>
    </Head>
    <div dangerouslySetInnerHTML={{ __html: doc.body.html }} />
  </>
)

export default Page
