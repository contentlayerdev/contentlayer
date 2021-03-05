export default {
    title: 'Review Item',
    name: 'review_item',
    type: 'object',
    preview: { select: { title: 'author' } },
    fields: [
        {
            type: 'string',
            title: 'Author',
            name: 'author'
        },
        {
            type: 'image',
            title: 'Avatar',
            name: 'avatar'
        },
        {
            type: 'text',
            title: 'Content',
            name: 'content'
        }
    ]
}
