// @ts-check
import { post } from '@sourcebit/sdk/types'
// import moment from 'moment-strftime'
// import { format} from 'date-fns'
import React, { FC } from 'react'
import { useSourcebit } from '../utils/next'

const BlogPostFooter: FC<{ post: post; dateType: 'long' | 'short' }> = ({ post, dateType }) => {
  const sourcebit = useSourcebit()

  const author = sourcebit
    .getDocumentsOfType({ type: 'person' })
    .find((_) => ((post.author as unknown) as string) === _.__meta.sourceFilePath)

  return (
    <footer className="post-meta">
      {/* <time className="published" dateTime={moment(post.date).strftime('%Y-%m-%d %H:%M')}>
        <time className="published" dateTime={format(post.date, '') moment(post.date).strftime('%Y-%m-%d %H:%M')}>
        {dateType === 'short' ? moment(post.date).strftime('%B %d, %Y') : moment(post.date).strftime('%A, %B %e, %Y')}
      </time> */}

      {author && `, by ' ${author.first_name} ${author.last_name}`}
    </footer>
  )
}

export default BlogPostFooter
