export default {
  type: 'object',
  name: 'pricing_plan',
  title: 'Pricing Plan',
  fields: [
    {
      type: 'string',
      name: 'title',
      title: 'Title',
      validation: null,
    },
    {
      type: 'string',
      name: 'subtitle',
      title: 'Subtitle',
      validation: null,
    },
    {
      type: 'string',
      name: 'price',
      title: 'Price',
      validation: null,
    },
    {
      type: 'markdown',
      name: 'details',
      title: 'Details',
      validation: null,
    },
    {
      type: 'boolean',
      name: 'highlight',
      title: 'Highlight',
      description: 'Make the plan stand out by adding a distinctive style',
      validation: null,
    },
    {
      type: 'array',
      name: 'actions',
      title: 'Action Buttons',
      validation: null,
      of: [
        {
          type: 'action',
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
}
