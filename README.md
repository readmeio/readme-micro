# @readme/micro

Send your OAS files to [ReadMe Micro](https://micro.readme.com/)

[![npm](https://img.shields.io/npm/v/@readme/micro)](https://npm.im/@readme/micro) [![Node.js CI](https://github.com/readmeio/readme-micro/actions/workflows/ci.yaml/badge.svg)](https://github.com/readmeio/readme-micro/actions/workflows/ci.yaml)

[![](https://raw.githubusercontent.com/readmeio/.github/main/oss-header.png)](https://readme.io)

## Usage

### As a GitHub Action

```yaml
name: ReadMe Micro

# Run workflow to sync OpenAPI files for every push to the `main` branch
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout this repo
        uses: actions/checkout@v3

      # Run GitHub Action to sync all OpenAPI files in the repo
      - name: GitHub Action
        uses: readmeio/readme-micro@v2.6.1
        with:
          readme-micro: "'**/*.{yaml,yml,json}' --key=\${{ secrets.README_MICRO_SECRET }}"
```

### As an npm package

```sh
npx @readme/micro@v2.6.1 './*{yaml,yml,json}' --key=$README_MICRO_SECRET
```

### As a Bitbucket Pipeline

```yaml
definitions:
  steps:
    - step: &readme-micro
        name: ReadMe Micro
        image: node:18
        script:
          - npx @readme/micro@v2.6.1 '**/*.{yaml,yml,json}' --key=$README_MICRO_SECRET

# Run Pipeline to sync OpenAPI files for every push to the `main` branch
pipelines:
  branches:
    main:
      - step: *readme-micro
  pull-requests:
    '**':
      - step: *readme-micro
```
