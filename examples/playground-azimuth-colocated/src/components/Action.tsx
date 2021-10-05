import { defineEmbedded } from 'contentlayer/source-files/schema'
import type { FC } from 'react'
import React from 'react'

import { classNames, Link, withPrefix } from '../utils'
import { Icon } from './Icon'
import type * as types from '.contentlayer/types'

export const Action: FC<{ action: types.Action }> = ({ action }) => (
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

export const ActionModel = defineEmbedded(() => ({
  name: 'Action',
  labelField: 'label',
  fields: {
    label: {
      type: 'string',
      label: 'Label',
      required: true,
    },
    url: {
      type: 'string',
      label: 'URL',
      required: true,
    },
    style: {
      type: 'enum',
      label: 'Style',
      options: ['link', 'primary', 'secondary'],
      default: 'link',
    },
    has_icon: {
      type: 'boolean',
      label: 'Show icon',
      default: false,
    },
    icon: {
      type: 'enum',
      label: 'Icon',
      options: [
        'arrow-left',
        'arrow-right',
        'envelope',
        'facebook',
        'github',
        'instagram',
        'linkedin',
        'twitter',
        'vimeo',
        'youtube',
      ],
    },
    icon_position: {
      type: 'enum',
      label: 'Icon position',
      options: ['left', 'right'],
      default: 'left',
      description: 'The position of the icon relative to text',
    },
    new_window: {
      type: 'boolean',
      label: 'Open in new window',
      default: false,
      description: 'Should the link open a new tab',
    },
    no_follow: {
      type: 'boolean',
      label: 'No follow',
      default: false,
      description: 'Add rel="nofollow" attribute to the link',
    },
  },
}))
