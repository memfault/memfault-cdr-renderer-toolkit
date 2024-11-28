# Memfault CDR Renderer Toolkit

A toolkit to build React applications meant to be rendered inside an `iframe`
within Memfault that can render special or proprietary Custom Data Recordings.

- [Development](#development)
  - [Using the Nix package manager](#using-the-nix-package-manager)
  - [Using other package managers](#using-other-package-managers)
  - [Running tests](#running-tests)
  - [Deploying](#deploying)

## Development

### Using the Nix package manager

Install [Nix](https://nixos.org/download/) and [`direnv`](https://direnv.net/) and run:

```sh
cp .envrc.example .envrc
direnv allow
yarn
yarn build
```

If you don't want to use `direnv`, you can also do the following:

```sh
nix develop
yarn
yarn build
```

### Using other package managers

Install system dependencies:

- [`biomejs`](https://biomejs.dev/): `^1.9.4`
- [`node`](https://nodejs.org/): `^20.18.0`
- [`yarn`](https://yarnpkg.com/): `^1.22`

Bootstrap and build:

```sh
yarn
yarn build
```

### Running tests

```sh
yarn test
```
