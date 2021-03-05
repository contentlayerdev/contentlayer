export default {
    title: 'Reviews Section',
    name: 'section_reviews',
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
            type: 'string',
            title: 'Background',
            name: 'background',
            description: 'The background of the section',
            validation: Rule => Rule.required(),
            options: {
                list: ['gray', 'white']
            }
        },
        {
            type: 'array',
            title: 'Reviews',
            name: 'reviews',
            of: [{type: 'review_item'}]
        }
    ]
}
