// @ts-check
import React from 'react'
import _ from 'lodash'
import moment from 'moment-strftime'

import { getData } from '../utils'

export default class BlogPostFooter extends React.Component {
  render() {
    // let post = _.get(this.props, 'page', null);
    const doc = this.props.doc
    console.log({ doc2: doc })
    let date_type = _.get(doc, 'date_type', null)
    return (
      <footer className="post-meta">
        <time
          className="published"
          dateTime={moment(doc.date).strftime('%Y-%m-%d %H:%M')}
        >
          {date_type === 'short'
            ? moment(doc.date).strftime('%B %d, %Y')
            : moment(doc.date).strftime('%A, %B %e, %Y')}
        </time>
        {_.get(doc, 'frontmatter.author', null) &&
          (() => {
            let author = getData(
              this.props.data,
              _.get(doc, 'frontmatter.author', null),
            )
            return ', by ' + author.first_name + author.last_name
          })()}
      </footer>
    )
  }
}
