import type { FC } from 'react'
import React from 'react'

import { Link, withPrefix } from '../utils'
import type * as types from 'contentlayer/generated'

export const ActionLink: FC<{ action: types.Action }> = ({ action }) => (
  <Link
    href={withPrefix(action.url)}
    target={action.new_window ? '_blank' : undefined}
    rel={action.new_window ? 'noopener' : action.no_follow ? 'nofollow' : undefined}
  >
    {action.label}
  </Link>
)
