import type { FC } from 'react'

import { allConceptual, allHowTo, allReference, allTutorial } from '.contentlayer'

export const getStaticProps = () => {
  const allDocs = [...allConceptual, ...allHowTo, ...allReference, ...allTutorial]
  const ids = allDocs.map((_) => _._id)

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
