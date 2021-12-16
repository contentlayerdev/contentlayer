const cliChangelogGenerator = require('@changesets/cli/changelog').default

module.exports = {
  default: {
    getDependencyReleaseLine: () => '',
    getReleaseLine: cliChangelogGenerator.getReleaseLine,
  },
}
