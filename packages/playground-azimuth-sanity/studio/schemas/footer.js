export default {
    title: 'Footer Configuration',
    name: 'footer',
    type: 'object',
    preview: { select: { title: 'tagline' } },
    fields: [
        {
            type: 'image',
            title: 'Logo',
            name: 'logo_img',
            description: 'The logo image displayed in the footer'
        },
        {
            type: 'string',
            title: 'Footer Tagline',
            name: 'tagline',
            description: 'The tagline displayed in the footer'
        },
        {
            type: 'boolean',
            title: 'Enable Navigation Menu',
            name: 'has_nav',
            description: 'Display the secondary navigation menu in the footer'
        },
        {
            type: 'string',
            title: 'Menu Title',
            name: 'nav_title',
            description: 'The title of the secondary menu displayed in the footer'
        },
        {
            type: 'array',
            title: 'Navigation Menu Links',
            name: 'nav_links',
            description: 'List of navigation links in footer',
            of: [{type: 'action'}]
        },
        {
            type: 'boolean',
            title: 'Enable Social Links',
            name: 'has_social',
            description: 'Display social links in the footer'
        },
        {
            type: 'string',
            title: 'Social Links Title',
            name: 'social_title',
            description: 'The title of the social links list displayed in the footer'
        },
        {
            type: 'array',
            title: 'Social Links',
            name: 'social_links',
            description: 'List of social links displayed in the footer',
            of: [{type: 'action'}]
        },
        {
            type: 'boolean',
            title: 'Enable Subscribe',
            name: 'has_subscribe',
            description: 'Display the newsletter subscription form in the footer'
        },
        {
            type: 'string',
            title: 'Subscribe Title',
            name: 'subscribe_title',
            description: 'The title of the subscribe block displayed in the footer'
        },
        {
            type: 'string',
            title: 'Subscribe Content',
            name: 'subscribe_content',
            description: 'The text content in the subscribe block displayed in the footer'
        },
        {
            type: 'string',
            title: 'Footer Content',
            name: 'content',
            description: 'The copyright text displayed in the footer'
        },
        {
            type: 'array',
            title: 'Links',
            name: 'links',
            of: [{type: 'action'}]
        }
    ]
}
