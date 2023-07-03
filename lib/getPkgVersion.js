// source adapted from `rdme`:
// https://github.com/readmeio/rdme/blob/HEAD/src/lib/getPkgVersion.ts#L26-L47

/**
 * The current `micro` version, extracted from the `package.json`.
 */
function getPkgVersion() {
  // eslint-disable-next-line global-require
  const pkg = require('../package.json');
  return `${pkg.version}`;
}

module.exports = getPkgVersion;
