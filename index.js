#!/usr/bin/env node

/* We'll make this better eventually, but for now we'll make it quickly! */

const fs = require('fs');
const path = require('path');

const core = require('@actions/core');
const axios = require('axios');
const commandLineArgs = require('command-line-args');
const { default: OASNormalize } = require('oas-normalize');
const swaggerInline = require('swagger-inline');

const getContext = require('./lib/context');
const getPkgVersion = require('./lib/getPkgVersion');
const utils = require('./utils');

require('dotenv').config({ path: path.join(__dirname, '.env') });

function log(...args) {
  if (process.env.NODE_ENV === 'test') return null;
  // eslint-disable-next-line no-console
  return console.log(...args);
}

async function main(opts) {
  const options = commandLineArgs(
    [
      { name: 'src', type: String, multiple: true, defaultOption: true },
      { name: 'key', alias: 'k', type: String },
    ],
    { partial: true }
  ); // this prevents the script from throwing during unit tests

  // This allows us to override the options during unit tests
  Object.assign(options, opts);

  const src = utils.listOas(options.src);

  const context = await getContext();

  const out = {
    markdown: undefined, // micro.md file
    specs: [], // the specs {filename, oas}
    ...context,
    // this package's version number
    actionVersion: getPkgVersion(),
    // adapted from `rdme` Action:
    // https://github.com/readmeio/rdme/blob/HEAD/src/lib/createGHA/index.ts#L262
    // https://github.com/readmeio/rdme/blob/HEAD/__tests__/lib/fetch.test.ts#L30
  };

  const markdown = path.join(process.cwd(), 'micro.md');
  if (fs.existsSync(markdown)) {
    out.markdown = fs.readFileSync(markdown, 'utf8');
  }

  for (let i = 0; i < src.length; i += 1) {
    const fileName = src[i];
    const file = path.join(process.cwd(), fileName);
    if (fs.existsSync(file)) {
      let oas = {};
      const original = fs.readFileSync(file, 'utf-8');
      if (fileName === 'api.config.json') {
        /*
        const prepare = await import('./api.js/prepare.js');
        oas = JSON.stringify((await prepare.default(process.cwd())).oas, undefined, 2);
        */
      } else {
        /* TODO: I would love Swagger Inline to eventually
         * use a glob from the OAS file itself, so hopefully
         * eventually we can do that!
         *
         * Like this:
         *
         *   path: '**\/*.js'
         *
         * */

        // eslint-disable-next-line no-await-in-loop
        oas = await swaggerInline(['**/*'], {
          base: file,
        });
      }

      const normalized = new OASNormalize(oas);

      out.specs.push({
        fileName,
        // eslint-disable-next-line no-await-in-loop
        oas: JSON.stringify(await normalized.bundle()),
        original,
      });
    }
  }

  const base = process.env.BASE_URL || 'https://micro.readme.com';

  return axios
    .post(`${base}/api/uploadSpec`, out, {
      headers: { 'X-API-KEY': options.key },
    })
    .then(() => {
      log('Successfully synced file to ReadMe Micro! 🦉');
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.log(error);
      // TODO not sure what this will do on bitbucket pipelines?
      core.setFailed(error.message);
      throw error;
    });
}

module.exports = main;

if (require.main === module) {
  main();
}
