export default {
  title: 'Post',
  name: 'post',
  type: 'document',
  preview: { select: { title: 'title' } },
  fields: [
    {
      type: 'string',
      title: 'Title',
      name: 'title',
      description: 'The title of the post',
      validation: Rule => Rule.required()
    },
    {
      type: 'slug',
      title: 'Slug',
      name: 'slug',
      description: 'The URL path of this page relative to the site domain',
      validation: Rule => Rule.required(),
      options: {
        source: 'title'
      }
    },
    {
      type: 'datetime',
      title: 'Date',
      name: 'date',
      validation: Rule => Rule.required()
    },
    {
      type: 'reference',
      title: 'Author',
      name: 'author',
      description: 'The author of the post',
      to: [{type: 'person'}]
    },
    {
      type: 'array',
      title: 'Categories',
      name: 'categories',
      description: 'Categories this blog relate to',
      of: [
        {
          type: 'reference',
          to: [{type: 'blog_category'}]
        }
      ]
    },
    {
      type: 'text',
      title: 'Subtitle',
      name: 'subtitle',
      description: 'The text shown just below the title or the featured image'
    },
    {
      type: 'image',
      title: 'Featured Image',
      name: 'image',
      description: 'The image shown below the title'
    },
    {
      type: 'image',
      title: 'Blog Feed Image',
      name: 'thumb_image',
      description: 'The image shown in the blog feed'
    },
    {
      type: 'markdown',
      title: 'Excerpt',
      name: 'excerpt',
      description: 'The excerpt of the post displayed in the blog feed'
    },
    {
      type: 'markdown',
      title: 'Content',
      name: 'content',
      description: 'Post content'
    }
  ]
}
