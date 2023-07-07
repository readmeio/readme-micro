const fs = require('fs');
const path = require('path');

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

    const GITIGNORE_LOCATION = path.join(__dirname, '.gitignore');
    const ig = ignore();
    if (fs.existsSync(GITIGNORE_LOCATION)) {
      ig.add(fs.readFileSync(GITIGNORE_LOCATION).toString());
    }

    return glob.sync(globs).filter(ig.createFilter()).filter(filterOas);
  },
};

module.exports.isOpenApiJson = isOpenApiJson;
module.exports.isOpenApiYaml = isOpenApiYaml;
