module.exports = {
  future: { webpack5: true },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
    // currently needed because of this error
    /*
    ./sourcebit/schema/documents/blog.ts:1:32
Type error: Cannot find module 'sourcebit/source-local' or its corresponding type declarations.
    */
  },
}
