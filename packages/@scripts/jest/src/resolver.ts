const resolver = require('enhanced-resolve').create.sync({
  conditionNames: ['require', 'node', 'default'],
  extensions: ['.js', '.json', '.node', '.ts', '.tsx'],
})

module.exports = (request: any, options: any) => {
  // list global module that must be resolved by defaultResolver here
  if (['fs', 'http', 'path'].includes(request)) {
    return options.defaultResolver(request, options)
  }
  return resolver(options.basedir, request)
}

export {}
// import * as resolve from 'enhanced-resolve'

// const resolver = resolve.create.sync({
//   conditionNames: ['require', 'node', 'default'],
//   extensions: ['.js', '.json', '.node', '.ts', '.tsx'],
// })

// const x = (request: any, options: any) => {
//   // list global module that must be resolved by defaultResolver here
//   if (['fs', 'http', 'path'].includes(request)) {
//     return options.defaultResolver(request, options)
//   }
//   return resolver(options.basedir, request)
// }

// export default x
