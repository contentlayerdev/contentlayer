import { GetStaticPaths, InferGetStaticPropsType } from 'next'
import { getMDXComponent } from 'mdx-bundler/client'

import { allDocs } from '.contentlayer/data'
import { useMemo } from 'react'
import { Button } from '../components/Button'

const mdxComponents = {
  Button,
}

const DocPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ doc, navInfo }) => {
  const MDXContent = useMemo(() => getMDXComponent(doc.body.code), [doc.body.code])

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

export const getStaticProps = ({ params: { slug = [] } }) => {
  const pagePath = slug.join('/')
  const doc = allDocs.find((doc) => doc._raw.flattenedPath === pagePath)

  const navInfo = allDocs.map((_) => ({ title: _.title, path: `/${_._raw.flattenedPath}` }))

  return { props: { doc, navInfo } }
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: allDocs.map((_) => `/${_._raw.flattenedPath}`),
  fallback: false,
})
