import { object } from '../../../lib/schema'
import { header } from './header'

export const config = object({
  name: 'config',
  label: 'Site Configuration',
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Title',
      description: 'Site title',
      required: true,
    },
    {
      type: 'string',
      name: 'path_prefix',
      label: 'Base URL',
      description:
        'The base URL of this site. Useful for sites hosted under specific path, e.g.: https://www.example.com/my-site/',
      required: true,
      hidden: true,
    },
    {
      type: 'string',
      name: 'domain',
      label: 'Domain',
      description:
        'The domain of your site, including the protocol, e.g. https://mysite.com/',
    },
    {
      type: 'image',
      name: 'favicon',
      label: 'Favicon',
      description: 'A square icon that represents your website',
    },
    {
      type: 'enum',
      name: 'palette',
      label: 'Color Palette',
      description: 'The color palette of the site',
      options: ['blue', 'cyan', 'green', 'orange', 'purple'],
      default: 'blue',
      required: true,
    },
    {
      type: 'enum',
      name: 'base_font',
      label: 'Font',
      options: ['fira-sans', 'nunito-sans', 'system-sans'],
      default: 'nunito-sans',
      required: true,
    },
    {
      type: 'object',
      name: 'header',
      label: 'Header Configuration',
      object: header,
    },
    {
      type: 'object',
      name: 'footer',
      label: 'Footer Configuration',
      models: ['footer'],
    },
  ],
  file: 'config.json',
})
