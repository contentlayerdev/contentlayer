# Contributing to Contentlayer

## Development setup

Contentlayer is developed as a mono-repo using Yarn.

### Cloning & installing dependencies

```sh
git clone --recurse-submodules git://github.com/contentlayerdev/contentlayer.git
yarn install
```

### Building the source

```sh
# One-time build
yarn build

# Build and watch files for changes
# ... or run `dev:ts` VSC task via `Tasks: Run Task`
yarn dev:ts
```

### Run tests

```sh
yarn test
```
