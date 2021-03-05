export default {
    title: 'Pricing Plan',
    name: 'pricing_plan',
    type: 'object',
    preview: { select: { title: 'title' } },
    fields: [
        {
            type: 'string',
            title: 'Title',
            name: 'title'
        },
        {
            type: 'string',
            title: 'Price',
            name: 'price'
        },
        {
            type: 'markdown',
            title: 'Details',
            name: 'details'
        },
        {
            type: 'boolean',
            title: 'Highlight',
            name: 'highlight',
            description: 'Make the plan stand out by adding a distinctive style'
        },
        {
            type: 'array',
            title: 'Action Buttons',
            name: 'actions',
            of: [{type: 'action'}]
        }
    ]
}
