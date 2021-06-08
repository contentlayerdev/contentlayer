import type { InferGetStaticPropsType } from 'next'
import type { FC } from 'react'

import { allDocuments } from '.contentlayer/data'

export const getStaticProps = () => {
  const docs = allDocuments.map((_) => ({ id: _._id, title: _.title }))

  return { props: { docs } }
}

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ docs }) => (
  <div>
    {docs.map((doc) => (
      <a style={{ display: 'block' }} key={doc.id} href={`/${doc.id.replace(/\.md$/, '')}`}>
        {doc.title}
      </a>
    ))}
  </div>
)

export default Page
