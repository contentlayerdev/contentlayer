module.exports = {
  name: 'fix-csb-deps',
  factory: (require) => {
    const crypto = require('crypto')

    // https://github.com/yarnpkg/berry/blob/5411f76bcd89d1d6f430f4bd0e16146ce9fdd370/packages/yarnpkg-core/sources/hashUtils.ts#L5-L26
    function makeHash(...args) {
      const hash = crypto.createHash(`sha512`)

      let acc = ``
      for (const arg of args) {
        if (typeof arg === `string`) {
          acc += arg
        } else if (arg) {
          if (acc) {
            hash.update(acc)
            acc = ``
          }

          hash.update(arg)
        }
      }

      if (acc) hash.update(acc)

      return hash.digest(`hex`)
    }

    return {
      hooks: {
        reduceDependency(dependency, project, locator, initialDependency, { resolver, resolveOptions }) {
          if (dependency.range.startsWith('https://pkg.csb.dev/') && !dependency.range.endsWith('/_pkg.tgz')) {
            const newRange = `${dependency.range}/_pkg.tgz`
            const fixedDescriptor = {
              identHash: dependency.identHash,
              scope: dependency.scope,
              name: dependency.name,
              descriptorHash: makeHash(dependency.identHash, newRange),
              range: newRange,
            }
            return fixedDescriptor
          }
          return dependency
        },
      },
    }
  },
}
