export default {
  type: 'document',
  name: 'person',
  title: 'Person',
  fields: [
    {
      type: 'string',
      name: 'first_name',
      title: 'First Name',
      validation: null,
    },
    {
      type: 'string',
      name: 'last_name',
      title: 'Last Name',
      validation: null,
    },
    {
      type: 'markdown',
      name: 'bio',
      title: 'Bio',
      validation: null,
    },
    {
      type: 'image',
      name: 'photo',
      title: 'Photo',
      validation: null,
    },
  ],
  preview: {
    select: {
      title: 'first_name',
    },
  },
}
