export default {
    title: 'Person',
    name: 'person',
    type: 'document',
    preview: { select: { title: 'first_name' } },
    fields: [
        {
            type: 'string',
            title: 'First Name',
            name: 'first_name',
            validation: Rule => Rule.required(),
        },
        {
            type: 'string',
            title: 'Last Name',
            name: 'last_name'
        },
        {
            type: 'image',
            title: 'Photo',
            name: 'photo',
            description: 'The photo of the person'
        },
        {
            type: 'markdown',
            title: 'Bio',
            name: 'bio',
        }
    ]
}
