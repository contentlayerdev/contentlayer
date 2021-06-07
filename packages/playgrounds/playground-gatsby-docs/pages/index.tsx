import type { FC } from 'react'

import { allDocuments } from '.contentlayer/data'

export const getStaticProps = () => {
  const ids = allDocuments.map((_) => _._id)

  return { props: { ids } }
}

const Page: FC<{ ids: string[] }> = ({ ids }) => (
  <div>
    {ids.map((id) => (
      <a style={{ display: 'block' }} key={id} href={`/${id}`}>
        {id}
      </a>
    ))}
  </div>
)

export default Page
