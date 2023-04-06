/* We'll make this better eventually, but for now we'll make it quickly! */

const fs = require('fs');
const path = require('path');
const OASNormalize = require('oas-normalize');

const github = require('@actions/github').context;
const core = require('@actions/core');

const utils = require('./utils');

const swaggerInline = require('swagger-inline');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const axios = require('axios');

async function main(opts) {
  const commandLineArgs = require('command-line-args');
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

  let out = {
    markdown: undefined, // micro.md file

    // For legacy reasons, we support 1 in oas
    // To make supporting multiple easier eventuall,
    // we also save them to `specs`.
    oas: undefined,
    specs: [], // the specs {filename, oas}

    ref: github.ref,
    sha: github.sha,
    actor: github.actor,
    runId: github.runId,
    payload: github.payload,
  };

  const markdown = path.join(process.cwd(), `micro.md`);
  if (fs.existsSync(markdown)) {
    out.markdown = fs.readFileSync(markdown, 'utf8');
  }

  for (var i = 0; i < src.length; i++) {
    var fileName = src[i];
    const file = path.join(process.cwd(), fileName);
    if (fs.existsSync(file)) {
      let oas = {};
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

        oas = await swaggerInline(['**/*'], {
          base: file,
        });
      }

      const normalized = new OASNormalize.default(oas);

      out.specs.push({
        fileName,
        oas: JSON.stringify(await normalized.bundle()),
      });
    }
  }

  // This should go away when we support multiple
  if (out.specs.length) {
    out.oas = out.specs[0];
    // Stubbing this out for now for easier testing.
    out.specs = undefined;
  }

  const base = process.env.BASE_URL || 'https://micro.readme.build';

  return axios
    .post(`${base}/api/uploadSpec`, out, {
      headers: { 'X-API-KEY': options.key },
    })
    .then(response => {
      console.log('Successfully synced file to ReadMe Micro! 🦉');
    })
    .catch(error => {
      console.log(error);
      core.setFailed(error.message);
      throw error;
    });
}

module.exports = main;

if (require.main === module) {
  main();
}
