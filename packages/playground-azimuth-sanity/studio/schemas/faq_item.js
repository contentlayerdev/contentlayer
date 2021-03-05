export default {
    title: 'FAQ Item',
    name: 'faq_item',
    type: 'object',
    preview: { select: { title: 'question' } },
    fields: [
        {
            type: 'text',
            title: 'Question',
            name: 'question'
        },
        {
            type: 'markdown',
            title: 'Answer',
            name: 'answer'
        }
    ]
}
