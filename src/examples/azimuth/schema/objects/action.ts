import { defineObject } from '../../../../lib/schema'

export const action = defineObject({
  name: 'action',
  label: 'Section',
  labelField: 'title',
  fields: [
    {
      type: 'string',
      name: 'section_id',
      label: 'Section ID',
      description:
        'A unique identifier of the section, must not contain whitespace',
    },
    {
      type: 'string',
      name: 'title',
      label: 'Title',
      description: 'The title of the section',
    },
    {
      type: 'string',
      name: 'title2',
      label: 'Title',
      description: 'The title of the section',
    },
  ],
})
