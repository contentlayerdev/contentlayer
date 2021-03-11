export default {
  type: 'object',
  name: 'action',
  title: 'Action',
  fields: [
    {
      type: 'string',
      name: 'label',
      title: 'Label',
      validation: (Rule) => Rule.required(),
    },
    {
      type: 'string',
      name: 'url',
      title: 'URL',
      initialValue: '#',
      validation: (Rule) => Rule.required(),
    },
    {
      type: 'string',
      name: 'style',
      title: 'Style',
      initialValue: 'link',
      validation: null,
      options: {
        list: ['link', 'primary', 'secondary'],
      },
    },
    {
      type: 'boolean',
      name: 'has_icon',
      title: 'Show icon',
      validation: null,
    },
    {
      type: 'string',
      name: 'icon',
      title: 'Icon',
      validation: null,
      options: {
        list: [
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
    },
    {
      type: 'string',
      name: 'icon_position',
      title: 'Icon position',
      description: 'The position of the icon relative to text',
      initialValue: 'left',
      validation: null,
      options: {
        list: ['left', 'right'],
      },
    },
    {
      type: 'boolean',
      name: 'new_window',
      title: 'Open in new window',
      description: 'Should the link open a new tab',
      validation: null,
    },
    {
      type: 'boolean',
      name: 'no_follow',
      title: 'No follow',
      description: 'Add rel="nofollow" attribute to the link',
      validation: null,
    },
  ],
  preview: {
    select: {
      title: 'label',
    },
  },
}
