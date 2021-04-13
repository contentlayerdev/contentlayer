import { action } from 'contentlayer/types'
import React, { FC } from 'react'
import { Link, withPrefix } from '../utils'

export const ActionLink: FC<{ action: action }> = ({ action }) => (
  <Link
    href={withPrefix(action.url)}
    target={action.new_window ? '_blank' : undefined}
    rel={action.new_window ? 'noopener' : action.no_follow ? 'nofollow' : undefined}
  >
    {action.label}
  </Link>
)
