export default {
    title: 'Blog Category',
    name: 'blog_category',
    type: 'document',
    preview: { select: { title: 'title' } },
    fields: [
        {
            type: 'string',
            title: 'Title',
            name: 'title',
            description: 'The title of the category',
            validation: Rule => Rule.required()
        },
        {
            type: 'slug',
            title: 'Slug',
            name: 'slug',
            description: 'The slug of the category',
            validation: Rule => Rule.required(),
            options: {
                source: 'title'
            }
        }
    ]
}
