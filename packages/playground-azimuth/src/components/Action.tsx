import { action } from 'contentlayer/types'
import React, { FC } from 'react'
import { classNames, Link, withPrefix } from '../utils'
import { Icon } from './Icon'

export const Action: FC<{ action: action }> = ({ action }) => (
  <Link
    href={withPrefix(action.url)}
    target={action.new_window ? '_blank' : undefined}
    rel={action.new_window ? 'noopener' : action.no_follow ? 'nofollow' : undefined}
    className={classNames({
      button: action.style === 'primary' || action.style === 'secondary',
      secondary: action.style === 'secondary',
      'has-icon': action.has_icon,
    })}
  >
    {action.icon && <Icon icon={action.icon} />}
    <span
      className={classNames({
        'order-first': action.icon_position === 'right',
      })}
    >
      {action.label}
    </span>
  </Link>
)
