// const { pathsToModuleNameMapper } = require('ts-jest/utils')
// const { compilerOptions } = require('../../tsconfig.json')

/** @typedef { import('ts-jest/dist/types') } */
/** @type { import('@jest/types').Config.InitialOptions } */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
  //   prefix: '<rootDir>/../../',
  // }),

  // moduleNameMapper: {
  //   'schemalayer/(.*)': '<rootDir>/packages/schemalayer/src/sdk/$1',
  // },
  // testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  // globals: {
  //   'ts-jest': {
  //     tsconfig: path.join(__dirname, 'tsconfig.sdk.json'),
  //   },
  // },
}
