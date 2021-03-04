import { Document, guards } from '@sourcebit/sdk'
import { config } from '@sourcebit/sdk/types'
import _ from 'lodash'
import React, { FC } from 'react'
import { Helmet } from 'react-helmet'
import { withPrefix } from '../utils'
import Footer from './Footer'
import { Header } from './Header'

const Layout: FC<{
  doc: Document
  config: config
}> = ({ doc, config, children, ...props }) => {
  const title = guards.hasField(doc, 'meta_title')
    ? doc.meta_title
    : `${guards.hasField(doc, 'title') ? doc.title : 'blank title'} | ${config.title}`

  const font = config.base_font ?? 'nunito-sans'

  return (
    <React.Fragment>
      <Helmet>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initialScale=1.0" />
        <meta name="google" content="notranslate" />
        {guards.hasField(doc, 'meta_description') && <meta name="description" content={doc.meta_description} />}
        {guards.hasField(doc, 'canonical_url') ? (
          <link rel="canonical" href={doc.canonical_url} />
        ) : (
          config.domain &&
          (() => {
            const domain = _.trim(config.domain, '/')
            const page_url = 'TODO'
            // let page_url = withPrefix(doc.__metadata.urlPath)
            return <link rel="canonical" href={domain + page_url} />
          })()
        )}
        {guards.hasField(doc, 'no_index') && doc.no_index && <meta name="robots" content="noindex,follow" />}
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
        <body className={'palette-' + config.palette + ' font-' + config.base_font} />
      </Helmet>
      <div id="page" className="site">
        <Header config={config} page={doc} {...props} />
        <main id="content" className="site-content">
          {children}
        </main>
        <Footer config={config} />
      </div>
    </React.Fragment>
  )
}

export default Layout
