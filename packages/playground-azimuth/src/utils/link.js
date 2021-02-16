import React from 'react';
import NextLink from 'next/link';

export default function Link({ children, href, ...other }) {
    // Pass Any internal link to Next.js Link, for anything else, use <a> tag
    const internal = /^\/(?!\/)/.test(href);

    if (internal) {
        // For root page, use index.js, for rest use [...slug].js
        const page = href === '/' ? '/' : '/[...slug]';
        return (
            <NextLink href={page} as={href}>
                <a {...other}>{children}</a>
            </NextLink>
        );
    }

    return <a href={href} {...other}>{children}</a>;
}
