export default {
    title: 'Action',
    name: 'action',
    type: 'object',
    preview: { select: { title: 'label' } },
    fields: [
        {
            type: 'string',
            title: 'Label',
            name: 'label',
            validation: Rule => Rule.required(),
        },
        {
            type: 'url',
            title: 'URL',
            name: 'url',
            validation: Rule => Rule.required().uri({allowRelative: true}),
        },
        {
            type: 'boolean',
            title: 'Primary',
            name: 'primary',
            description: 'Use primary color for this action'
        },
        {
            type: 'boolean',
            title: 'Open in new window',
            name: 'new_window',
            description: 'Should the link open a new tab'
        }
    ]
}
