// import moment from 'moment-strftime'
// import { format} from 'date-fns'
import type { FC } from 'react'
import React, { useMemo } from 'react'

import { allPeople } from '.contentlayer/data'
import type { Post } from '.contentlayer/types'

export const BlogPostFooter: FC<{ post: Post; dateType: 'long' | 'short' }> = ({ post, dateType }) => {
  const author = useMemo(() => allPeople.find((_) => post.author === _._id), [post])

  return (
    <footer className="post-meta">
      {/* <time className="published" dateTime={moment(post.date).strftime('%Y-%m-%d %H:%M')}>
        <time className="published" dateTime={format(post.date, '') moment(post.date).strftime('%Y-%m-%d %H:%M')}>
        {dateType === 'short' ? moment(post.date).strftime('%B %d, %Y') : moment(post.date).strftime('%A, %B %e, %Y')}
      </time> */}

      {author && `by '${author.first_name} ${author.last_name}`}
    </footer>
  )
}
