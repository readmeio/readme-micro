/*
 * This is an attempt to gather the same `context` regardless
 * of where this code is being run (bitbucket or github actions)
 *
 * The general shape of the object we require is like this:
 *
 * ref: The fully-formed ref of the branch or tag that triggered the workflow run.
 * sha: The commit SHA that triggered the workflow.
 * actor: The name of the person or app that initiated the workflow.
 * runId: A unique number for each workflow run within a repository.
 * payload: The event webhook payload. Fetched from "GITHUB_EVENT_PATH"
 *
 * The payload needs to look like this:
 * repository: { name: 'The name of the repo' }
 * commits: [{ message: 'The commit message that triggered the workflow', author: { username: 'The username of the person who committed it' }}]
 *
 * https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables
 *
 * This is modelled off of the object that's returned from
 * `require('@actions/github').context` and that's what we're
 * using for github.
 *
 * Bitbucket doesn't have a module like this so we have to construct
 * it ourselves based on what they do give us.
 */

module.exports = function getContext() {
  // eslint-disable-next-line global-require
  const ci = require('ci-info');
  // eslint-disable-next-line global-require
  const { context } = require('@actions/github');

  switch (ci.name) {
    case 'GitHub Actions':
      return context;
    case 'Bitbucket':
      break;
    default:
      throw new Error(`Unexpected CI environment: ${ci.name}`);
  }
  return {};
};
