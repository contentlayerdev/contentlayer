import { defineNestedType } from 'contentlayer2/source-files'

export const Action = defineNestedType(() => ({
  name: 'Action',
  fields: {
    label: {
      type: 'string',
      required: true,
    },
    url: {
      type: 'string',
      required: true,
    },
    style: {
      type: 'enum',
      options: ['link', 'primary', 'secondary'],
      default: 'link',
    },
    has_icon: {
      type: 'boolean',
      default: false,
    },
    icon: {
      type: 'enum',
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
      options: ['left', 'right'],
      default: 'left',
      description: 'The position of the icon relative to text',
    },
    new_window: {
      type: 'boolean',
      default: false,
      description: 'Should the link open a new tab',
    },
    no_follow: {
      type: 'boolean',
      default: false,
      description: 'Add rel="nofollow" attribute to the link',
    },
  },
  extensions: {
    stackbit: {
      labelField: 'label',
      fields: {
        label: { label: 'Label' },
        url: { label: 'URL' },
        style: { label: 'Style' },
        has_icon: { label: 'Show icon' },
        icon: { label: 'Icon' },
        icon_position: { label: 'Icon position' },
        new_window: { label: 'Open in new window' },
        no_follow: { label: 'No follow' },
      },
    },
  },
}))
