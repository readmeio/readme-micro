const { context } = require('@actions/github');
const axios = require('axios');
const ci = require('ci-info');

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
 *
 * https://support.atlassian.com/bitbucket-cloud/docs/variables-and-secrets/
 */

module.exports = async function getContext() {
  switch (ci.name) {
    case 'GitHub Actions':
      return context;
    case 'Bitbucket Pipelines': {
      // Pipelines dont give us the username of the user who made the action
      // happen, so we have to make an extra request to fetch this
      // https://jira.atlassian.com/browse/BCLOUD-16711
      const response = await axios.get(
        `https://api.bitbucket.org/2.0/users/${process.env.BITBUCKET_STEP_TRIGGERER_UUID}`,
        {
          // We're okay with some level of error here
          validateStatus(status) {
            return status >= 200 && status < 500; // default
          },
        }
      );

      const actor = response.data.display_name || 'Unknown User';

      return {
        ref: process.env.BITBUCKET_TAG
          ? `refs/tags/${process.env.BITBUCKET_TAG}`
          : `refs/heads/${process.env.BITBUCKET_BRANCH}`,
        sha: process.env.BITBUCKET_COMMIT,
        actor,
        runId: parseInt(process.env.BITBUCKET_BUILD_NUMBER, 10),
        payload: {
          repository: {
            name: process.env.BITBUCKET_REPO_SLUG,
          },
          // commits: [
          //   {
          //     message: execSync('git log --format=%B -n 1 $BITBUCKET_COMMIT', {
          //       env: { BITBUCKET_COMMIT: process.env.BITBUCKET_COMMIT },
          //       encoding: 'utf-8',
          //     }).trim(),
          //     author: {
          //       username: actor,
          //     },
          //   },
          // ],
        },
      };
    }
    default:
      return {};
  }
};
