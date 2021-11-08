import { GetStaticPaths, InferGetStaticPropsType } from 'next'
import { useMDXComponent } from 'next-contentlayer/hooks'

import { allDocs } from '.contentlayer/data'
import { Button } from '../components/Button'
import { Doc } from '.contentlayer/types'

const mdxComponents = {
  Button,
}

const DocPage: React.FC<StaticProps> = ({ doc, navInfo }) => {
  const MDXContent = useMDXComponent(doc.body.code)

  return (
    <div>
      <div style={{ display: 'flex', paddingBottom: 10, borderBottom: '1px solid #eee' }}>
        {navInfo.map(({ path, title }) => (
          <a key={path} href={path} style={{ paddingRight: 6 }}>
            {title}
          </a>
        ))}
      </div>
      <h1>{doc.title}</h1>
      <MDXContent components={mdxComponents} />
    </div>
  )
}

export default DocPage

type StaticProps = {
  doc: Doc
  navInfo: { title: string; path: string }[]
}

export const getStaticProps = ({ params: { slug = [] } }): { props: StaticProps } => {
  const pagePath = slug.join('/')
  const doc = allDocs.find((doc) => doc._raw.flattenedPath === pagePath)!

  const navInfo = allDocs.map((_) => ({ title: _.title, path: `/${_._raw.flattenedPath}` }))

  return { props: { doc, navInfo } }
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: allDocs.map((_) => `/${_._raw.flattenedPath}`),
  fallback: false,
})
