export default {
  type: 'object',
  name: 'faq_item',
  title: 'FAQ Item',
  fields: [
    {
      type: 'text',
      name: 'question',
      title: 'Question',
      validation: null,
    },
    {
      type: 'markdown',
      name: 'answer',
      title: 'Answer',
      validation: null,
    },
  ],
  preview: {
    select: {
      title: 'type',
    },
  },
}
