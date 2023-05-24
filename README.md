# @readme/micro

Send your OAS files to [ReadMe Micro](https://micro.readme.com/)

[![npm](https://img.shields.io/npm/v/@readme/micro)](https://npm.im/@readme/micro) [![Node.js CI](https://github.com/readmeio/readme-micro/actions/workflows/ci.yaml/badge.svg)](https://github.com/readmeio/readme-micro/actions/workflows/ci.yaml)

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

## Usage

### As a GitHub Action

```yaml
name: ReadMe Micro

# Run workflow for every push to the `main` branch
on:
  push:
    branches:
      - main
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout this repo
        uses: actions/checkout@v3

      - name: GitHub Action
        uses: readmeio/readme-micro@v2.1.1
        with:
          readme-micro: "'**/*.{yaml,yml,json}' --key=\${{ secrets.README_MICRO_SECRET }}"
```

### As an npm package

```sh
npx @readme/micro@v2.1.1 './*{yaml,yml,json}' --key=$README_MICRO_SECRET
```

### As a Bitbucket Pipeline

```yaml
image: node:18

pipelines:
  default:
    - parallel:
        - step:
            name: ReadMe Micro
            script:
              - npx @readme/micro@v2.1.1 './*{yaml,yml,json}' --key=$README_MICRO_SECRET
```
