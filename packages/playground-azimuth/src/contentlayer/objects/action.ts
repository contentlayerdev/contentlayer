import { defineObject } from 'contentlayer/source-local'

export const action = defineObject(() => ({
  name: 'action',
  label: 'Action',
  labelField: 'title',
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
