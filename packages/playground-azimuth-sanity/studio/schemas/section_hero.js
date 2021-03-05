export default {
    title: 'Hero Section',
    name: 'section_hero',
    type: 'object',
    preview: { select: { title: 'title' } },
    fields: [
        {
            type: 'string',
            title: 'Element ID',
            name: 'section_id',
            description: 'Element ID can be used in links to scroll the page to this section when link clicked'
        },
        {
            type: 'string',
            title: 'Title',
            name: 'title',
            description: 'The title of this section'
        },
        {
            type: 'markdown',
            title: 'Content',
            name: 'content',
            description: 'The text content of the section'
        },
        {
            type: 'image',
            title: 'Image',
            name: 'image',
            description: 'The image of the section'
        },
        {
            type: 'array',
            title: 'Action Buttons',
            name: 'actions',
            of: [{type: 'action'}]
        }
    ]
}
