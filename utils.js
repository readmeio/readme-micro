const fs = require('fs');
const path = require('path');

const spectralCore = require('@stoplight/spectral-core');
const { Spectral, Document } = spectralCore;
const { truthy } = require('@stoplight/spectral-functions'); // this has to be installed as well
const Parsers = require('@stoplight/spectral-parsers'); // make sure to install the package if you intend to use default parsers!

const glob = require('glob');
const ignore = require('ignore');

function isOpenApiJson(json) {
  return !!(json.openapi || json.swagger);
}

function isOpenApiYaml(yaml) {
  // eslint-disable-next-line unicorn/no-unsafe-regex
  return !!yaml.match(/\s?(openapi|swagger):\s([\s("|').0-9]+){3,}/);
}

function filterOas(file) {
  if (file.match(/.json$/)) {
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const j = require(path.join(process.cwd(), file));
      return isOpenApiJson(j);
    } catch (e) {
      /* empty */
    }
  }
  if (file.match(/.(yaml|yml)/)) {
    const j = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
    return isOpenApiYaml(j);
  }
  return false;
}

module.exports = {
  listOas(globs) {
    if (
      fs.existsSync(path.join(process.cwd(), 'api.config.json')) &&
      fs.existsSync(path.join(process.cwd(), 'endpoints'))
    ) {
      return ['api.config.json'];
    }

    if (!globs || !globs.length) {
      // eslint-disable-next-line no-param-reassign
      globs = ['**/*.{yaml,yml,json}'];
    }

    const GITIGNORE_LOCATION = path.join(process.cwd(), '.gitignore');
    const ig = ignore();
    if (fs.existsSync(GITIGNORE_LOCATION)) {
      ig.add(fs.readFileSync(GITIGNORE_LOCATION).toString());
    }

    return glob.sync(globs).filter(ig.createFilter()).filter(filterOas);
  },

  async lint(spec) {
    return new Promise((resolve, reject) => {
      // this will be our API specification document

      const myDocument = new Document(spec.oas, Parsers.Json, 'oas');
      const spectral = new Spectral();
      spectral.setRuleset({
        extends: 'spectral:oas',
        rules: {
          'openapi-tags': false,
          'operation-tags': false,
        },
      });

      // we lint our document using the ruleset we passed to the Spectral object
      spectral.run(myDocument).then(results => {
        resolve({ success: !results.length, output: results });
      });
    });
  },
};

module.exports.isOpenApiJson = isOpenApiJson;
module.exports.isOpenApiYaml = isOpenApiYaml;
