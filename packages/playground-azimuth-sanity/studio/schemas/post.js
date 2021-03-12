export default {
  type: 'document',
  name: 'post',
  title: 'Post',
  fields: [
    {
      type: 'string',
      name: 'title',
      title: 'Title',
      description: 'The title of the post',
      validation: (Rule) => Rule.required(),
    },
    {
      type: 'string',
      name: 'subtitle',
      title: 'Subtitle',
      description: 'The text shown just below the title or the featured image',
      validation: null,
    },
    {
      type: 'date',
      name: 'date',
      title: 'Date',
      validation: (Rule) => Rule.required(),
    },
    {
      type: 'reference',
      name: 'author',
      title: 'Author',
      description: 'Post author',
      validation: null,
      to: [
        {
          type: 'person',
        },
      ],
    },
    {
      type: 'string',
      name: 'excerpt',
      title: 'Excerpt',
      description: 'The excerpt of the post displayed in the blog feed',
      validation: null,
    },
    {
      type: 'image',
      name: 'image',
      title: 'Image (single post)',
      description: 'The image shown below the title',
      validation: null,
    },
    {
      type: 'string',
      name: 'image_alt',
      title: 'Image alt text (single post)',
      description: 'The alt text of the featured image',
      validation: null,
    },
    {
      type: 'image',
      name: 'thumb_image',
      title: 'Image (blog feed)',
      description: 'The image shown in the blog feed',
      validation: null,
    },
    {
      type: 'string',
      name: 'thumb_image_alt',
      title: 'Image alt text (blog feed)',
      description: 'The alt text of the blog feed image',
      validation: null,
    },
    {
      type: 'string',
      name: 'url_path',
      title: 'URL Path',
      description:
        'The URL path of this page relative to site root. For example, the site root page would be "/", and post page would be "posts/new-post/"',
      validation: (Rule) => Rule.required(),
    },
    {
      type: 'seo',
      name: 'seo',
      title: 'Seo',
      validation: null,
    },
    {
      type: 'markdown',
      name: 'content',
      title: 'Content',
      description: 'Page content',
      validation: null,
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
}
