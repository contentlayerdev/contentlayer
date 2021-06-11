import { getMDXComponent } from 'mdx-bundler/client'
import Head from 'next/head'
import type { FC } from 'react'
import { useMemo } from 'react'

import { components } from '../radix/components/MDXComponents'
import { allDocuments } from '.contentlayer/data'
import type { DocumentTypes } from '.contentlayer/types'

export const getStaticPaths = () => {
  const paths = allDocuments.map((_) => `/${_._raw.flattenedPath}`)

  return { paths, fallback: false }
}

export const getStaticProps = (context: any) => {
  const doc = allDocuments.find((_) => _._raw.flattenedPath === context.params.id.join('/'))

  return { props: { doc } }
}

const Page: FC<{ doc: DocumentTypes }> = ({ doc }) => {
  const Component = useMemo(() => getMDXComponent(doc.content.code), [doc.content.code])
  return (
    <>
      <Head>
        <title>{doc._id}</title>
      </Head>
      <Component components={components} />
    </>
  )
}

export default Page
