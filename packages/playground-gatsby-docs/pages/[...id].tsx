import type { FC } from 'react'

import type { DocumentTypes } from '.contentlayer'
import { allConceptual, allHowTo, allReference, allTutorial } from '.contentlayer'

export const getStaticPaths = () => {
  const paths = [...allConceptual, ...allHowTo, ...allReference, ...allTutorial].map((_) => `/${_._id}`)

  return { paths, fallback: false }
}

export const getStaticProps = (context: any) => {
  const allDocs = [...allConceptual, ...allHowTo, ...allReference, ...allTutorial]
  const doc = allDocs.find((_) => _._id === context.params.id.join('/'))

  return { props: { doc } }
}

const Page: FC<{ doc: DocumentTypes }> = ({ doc }) => (
  <div dangerouslySetInnerHTML={{ __html: doc.content?.html ?? '' }} />
)

export default Page
