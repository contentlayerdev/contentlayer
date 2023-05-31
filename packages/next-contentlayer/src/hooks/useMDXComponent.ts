import type { MDXComponents } from 'mdx/types'
// NOTE use ESM/CommonJS compat import here until resolved: https://github.com/facebook/react/issues/11503
import React from 'react'
// NOTE use ESM/CommonJS compat import here until resolved: https://github.com/facebook/react/issues/11503
import ReactDOM from 'react-dom'

// @ts-expect-error React version workaround (This CJS workaround can be removed once Contentlayer is only targeting React 18+)
import { _jsx_runtime } from './jsx-runtime.cjs'

// NOTE This cjs-import workaround above is needed since there was a "breaking change"
// on the import/export level from React v17 to v18.
// This workaround should work in Next.js since it supports both CJS and ESM at the same time.
//
// See https://github.com/contentlayerdev/contentlayer/issues/162
// import * as _jsx_runtime from 'react/jsx-runtime'

type MDXContentProps = {
  [props: string]: unknown
  components?: MDXComponents
}

export const getMDXComponent = (code: string, globals: Record<string, unknown> = {}): React.FC<MDXContentProps> => {
  const scope = { React, ReactDOM, _jsx_runtime, ...globals }
  const fn = new Function(...Object.keys(scope), code)
  return fn(...Object.values(scope)).default
}

export const useMDXComponent = (code: string, globals: Record<string, unknown> = {}) => {
  return React.useMemo(() => getMDXComponent(code, globals), [code, globals])
}
