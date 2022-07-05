# Contributing to Contentlayer

[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-ready--to--code-908a85?logo=gitpod)](https://gitpod.io/#https://github.com/contentlayerdev/contentlayer)

## Development setup

Contentlayer is developed as a mono-repo using Yarn.

### Cloning

```sh
git clone --recurse-submodules git://github.com/contentlayerdev/contentlayer.git
```

#### Checkout submodules

```sh
git submodule update --init --recursive
```

#### Installing Dependencies

```sh
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
