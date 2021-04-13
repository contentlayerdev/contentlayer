// import moment from 'moment-strftime'
// import { format} from 'date-fns'
import { person, post } from 'contentlayer/types'
import React, { FC, useMemo } from 'react'

export const BlogPostFooter: FC<{ post: post; dateType: 'long' | 'short'; persons: person[] }> = ({
  post,
  dateType,
  persons,
}) => {
  const author = useMemo(() => persons.find((_) => post.author === _._id), [post._id, persons])

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
