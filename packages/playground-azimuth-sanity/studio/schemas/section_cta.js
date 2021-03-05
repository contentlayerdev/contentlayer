export default {
    title: 'Call to Action Section',
    name: 'section_cta',
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
            type: 'text',
            title: 'Subtitle',
            name: 'subtitle',
            description: 'The subtitle of this section'
        },
        {
            type: 'array',
            title: 'Action Buttons',
            name: 'actions',
            of: [{type: 'action'}]
        }
    ]
}
