import * as path from 'path'

module.exports = {
  // resolves from test to snapshot path
  resolveSnapshotPath: (testPath: string, snapshotExtension: string): string => {
    const fileName = path.basename(testPath).replace('spec.js', 'spec.ts')
    const dirPath = path.dirname(testPath).replace('dist', 'src')
    const snapshotPath = path.join(dirPath, '__snapshots__', `${fileName}${snapshotExtension}`)

    return snapshotPath
  },

  // resolves from snapshot to test path
  resolveTestPath: (snapshotFilePath: string, snapshotExtension: string): string => {
    const fileName = path.basename(snapshotFilePath).slice(0, -snapshotExtension.length).replace('spec.ts', 'spec.js')
    const dirPath = path.dirname(snapshotFilePath).replace('src', 'dist').replace('/__snapshots__', '')
    return path.join(dirPath, fileName)
  },

  // Example test path, used for preflight consistency check of the implementation above
  testPathForConsistencyCheck: 'some/__tests__/example.spec.js',
}
// import * as path from 'path'

// const x = {
//   // resolves from test to snapshot path
//   resolveSnapshotPath: (testPath: string, snapshotExtension: string): string => {
//     const fileName = path.basename(testPath).replace('spec.js', 'spec.ts')
//     const dirPath = path.dirname(testPath).replace('dist', 'src')
//     const snapshotPath = path.join(dirPath, '__snapshots__', `${fileName}${snapshotExtension}`)

//     return snapshotPath
//   },

//   // resolves from snapshot to test path
//   resolveTestPath: (snapshotFilePath: string, snapshotExtension: string): string => {
//     const fileName = path.basename(snapshotFilePath).slice(0, -snapshotExtension.length).replace('spec.ts', 'spec.js')
//     const dirPath = path.dirname(snapshotFilePath).replace('src', 'dist').replace('/__snapshots__', '')
//     return path.join(dirPath, fileName)
//   },

//   // Example test path, used for preflight consistency check of the implementation above
//   testPathForConsistencyCheck: 'some/__tests__/example.spec.js',
// }

// export default x
