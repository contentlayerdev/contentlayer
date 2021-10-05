import NextLink from 'next/link'
import React, { FC, HTMLProps } from 'react'

const Link: FC<HTMLProps<HTMLAnchorElement>> = ({ children, href, ...props }) => {
  // Pass Any internal link to Next.js Link, for anything else, use <a> tag
  const internal = /^\/(?!\/)/.test(href ?? '')

  if (internal) {
    // For root page, use index.js, for rest use [...slug].js
    const page = href === '/' ? '/' : '/[...slug]'
    return (
      <NextLink href={page} as={href}>
        <a {...props}>{children}</a>
      </NextLink>
    )
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}

export default Link
