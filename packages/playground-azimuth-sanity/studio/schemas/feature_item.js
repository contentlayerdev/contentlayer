export default {
    title: 'Feature Item',
    name: 'feature_item',
    type: 'object',
    preview: { select: { title: 'title' } },
    fields: [
        {
            type: 'string',
            title: 'Title',
            name: 'title'
        },
        {
            type: 'markdown',
            title: 'Content',
            name: 'content',
            description: 'Feature description'
        },
        {
            type: 'image',
            title: 'Image',
            name: 'image',
            description: 'Feature image'
        },
        {
            type: 'array',
            title: 'Action Buttons',
            name: 'actions',
            of: [{type: 'action'}]
        }
    ]
}
