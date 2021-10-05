export const sectionBaseFields = {
  section_id: {
    type: 'string',
    label: 'Section ID',
    description: 'A unique identifier of the section, must not contain whitespace',
  },
  title: {
    type: 'string',
    label: 'Title',
    description: 'The title of the section',
  },
  type: {
    type: 'string',
    label: 'Section type',
    required: true,
    description: 'Needed for contentlayer for polymorphic list types',
  },
} as const
