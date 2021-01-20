import { object } from '../../../lib/schema'
import { action } from './action'

export const header = object({
  name: 'header',
  label: 'Header Configuration',
  fields: [
    {
      type: 'image',
      name: 'logo_img',
      label: 'Logo',
      description:
        'The logo image displayed in the header (if no logo added, the site title is displayed instead)',
    },
    {
      type: 'string',
      name: 'logo_img_alt',
      label: 'Logo Alt Text',
      description: 'The alt text of the logo image',
    },
    {
      type: 'boolean',
      name: 'has_nav',
      label: 'Enable Navigation',
      description: 'Display the navigation menu bar in the header',
      default: true,
    },
    {
      type: 'object',
      list: true,
      name: 'nav_links',
      label: 'Navigation Links',
      description: 'List of navigation links',
      object: [action],
    },
  ],
})
