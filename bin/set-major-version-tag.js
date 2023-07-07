#!/usr/bin/env node
/* eslint-disable no-console */

// Inspired by https://github.com/readmeio/rdme/blob/edc68c365e9f39f41a16cf389ee960bf71f6425e/bin/set-major-version-tag.js
// https://github.com/readmeio/readme-micro/issues/9

/**
 * Sets major git tag as part of release process
 *
 * @example v7
 */
const { execSync } = require('child_process');

// eslint-disable-next-line import/no-extraneous-dependencies
const semverParse = require('semver/functions/parse');

const pkg = require('../package.json');

async function setMajorVersionTag() {
  const parsedVersion = semverParse(pkg.version);

  if (parsedVersion.prerelease.length) {
    console.warn('Pre-release version, not setting major version tag');
    return process.exit(0);
  }

  const cmd = `git tag v${parsedVersion.major} -f -m 'Top-level tag pointing to ${parsedVersion.version}'`;

  console.log(`$ ${cmd}`);

  try {
    const stdout = execSync(cmd);
    console.log(stdout.toString());
    return process.exit(0);
  } catch (e) {
    console.error('Error running command', e);
    return process.exit(1);
  }
}

setMajorVersionTag();
