import { format, parseISO } from 'date-fns'
import type { FC } from 'react'

export const FormattedDate: FC<{ dateString: string }> = ({ dateString }) => {
  const date = parseISO(dateString)
  return <time dateTime={dateString}>{format(date, 'LLLL d, yyyy')}</time>
}
