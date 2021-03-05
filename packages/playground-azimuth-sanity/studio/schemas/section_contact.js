export default {
    title: 'Contact Section',
    name: 'section_contact',
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
            description: 'The text shown below the title'
        },
        {
            type: 'markdown',
            title: 'Content',
            name: 'content',
            description: 'Section content, appears before contact form'
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
        }
    ]
}
