import type { InferGetStaticPropsType } from 'next'
import type { FC } from 'react'

import { allDocuments } from 'contentlayer/generated'

export const getStaticProps = () => {
  const docs = allDocuments.map((_) => ({ path: _._raw.flattenedPath, title: _.title }))

  return { props: { docs } }
}

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ docs }) => (
  <div>
    {docs.map((doc) => (
      <a style={{ display: 'block' }} key={doc.path} href={`/${doc.path}`}>
        {doc.title}
      </a>
    ))}
  </div>
)

export default Page
