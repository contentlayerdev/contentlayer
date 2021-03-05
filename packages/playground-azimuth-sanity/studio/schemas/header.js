export default {
    title: 'Header Configuration',
    name: 'header',
    type: 'object',
    preview: { select: { title: 'title' } },
    fields: [
        {
            type: 'string',
            title: 'Header Title',
            name: 'title',
            description: 'The title displayed in the header if logo image not specified'
        },
        {
            type: 'image',
            title: 'Logo',
            name: 'logo_img',
            description: 'The logo image displayed in the header'
        },
        {
            type: 'boolean',
            title: 'Enable Navigation Menu',
            name: 'has_nav',
            description: 'Display the navigation menu bar in the header'
        },
        {
            type: 'array',
            title: 'Navigation Menu Links',
            name: 'nav_links',
            description: 'List of navigation links in header',
            of: [{type: 'action'}]
        }
    ]
}
