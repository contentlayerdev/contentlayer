import { action } from '@sourcebit/sdk/types'
import React, { FC } from 'react'
import { Link, withPrefix } from '../utils'

const ActionLink: FC<{ action: action }> = ({ action }) => (
  <Link
    href={withPrefix(action.url)}
    target={action.new_window ? '_blank' : undefined}
    rel={action.new_window ? 'noopener' : action.no_follow ? 'nofollow' : undefined}
  >
    {action.label}
  </Link>
)

export default ActionLink
