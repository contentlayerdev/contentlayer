import { defineObject } from '@sourcebit/source-local'

export const action = defineObject({
  name: 'action',
  label: 'Section',
  labelField: 'title',
  fields: [
    {
      type: 'string',
      name: 'label',
      label: 'Label',
      required: true,
    },
    {
      type: 'string',
      name: 'url',
      label: 'URL',
      required: true,
      // "widget": "url"
    },
    {
      type: 'enum',
      name: 'style',
      label: 'Style',
      options: ['link', 'primary', 'secondary'],
      default: 'link',
    },
    {
      type: 'boolean',
      name: 'has_icon',
      label: 'Show icon',
      default: false,
    },
    {
      type: 'enum',
      name: 'icon',
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
    {
      type: 'enum',
      name: 'icon_position',
      label: 'Icon position',
      options: ['left', 'right'],
      default: 'left',
      description: 'The position of the icon relative to text',
    },
    {
      type: 'boolean',
      name: 'new_window',
      label: 'Open in new window',
      default: false,
      description: 'Should the link open a new tab',
    },
    {
      type: 'boolean',
      name: 'no_follow',
      label: 'No follow',
      default: false,
      description: 'Add rel="nofollow" attribute to the link',
    },
  ],
})
