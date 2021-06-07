import { blog, config, landing, page, post } from 'contentlayer/types'
import _ from 'lodash'
import React, { FC } from 'react'
import { Helmet } from 'react-helmet'
import { withPrefix } from '../utils'
import { Footer } from './footer/Footer'
import { Header } from './Header'

export const Layout: FC<{
  doc: blog | page | landing | post
  config: config
}> = ({ doc, config, children, ...props }) => {
  const font = config.base_font ?? 'nunito-sans'

  return (
    <>
      <Helmet>
        <title>{doc.seo?.title ?? config.title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initialScale=1.0" />
        <meta name="google" content="notranslate" />
        {doc.seo?.description && <meta name="description" content={doc.seo.description} />}
        {doc.seo?.extra?.map((meta, meta_idx) => {
          const keyName = meta.keyName ?? 'name'
          return meta.relativeUrl ? (
            config.domain &&
              (() => {
                const domain = _.trim(config.domain, '/')
                const rel_url = withPrefix(meta.value)
                const full_url = domain + rel_url
                return <meta key={meta_idx} {...{ [keyName]: meta.name }} content={full_url} />
              })()
          ) : (
            <meta key={meta_idx + '.1'} {...{ [keyName]: meta.name }} content={meta.value} />
          )
        })}
        {font !== 'system-sans' && <link rel="preconnect" href="https://fonts.gstatic.com" />}
        {font === 'nunito-sans' ? (
          <link
            href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
            rel="stylesheet"
          />
        ) : (
          font === 'fira-sans' && (
            <link
              href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,400;0,600;1,400;1,600&display=swap"
              rel="stylesheet"
            />
          )
        )}
        {config.favicon && <link rel="icon" href={withPrefix(config.favicon)} />}
        <body className={`palette-${config.palette} font-${font}`} />
      </Helmet>
      <div id="page" className="site">
        <Header config={config} page={doc} {...props} />
        <main id="content" className="site-content">
          {children}
        </main>
        <Footer config={config} />
      </div>
    </>
  )
}
