const { execSync } = require('child_process');

const githubPayload = require('../__fixtures__/github-payload.json');

describe('getContext()', () => {
  // https://stackoverflow.com/a/48042799
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('github', () => {
    it('should pull `context` from environment variables', () => {
      // https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables
      // https://github.com/actions/toolkit/blob/457303960f03375db6f033e214b9f90d79c3fe5c/packages/github/src/context.ts#L28-L53
      process.env.GITHUB_ACTIONS = true;
      process.env.GITHUB_REF = 'main';
      process.env.GITHUB_SHA = 'cbdf6e46ddb43ef688b6127637a71895139b1021';
      process.env.GITHUB_ACTOR = 'domharrington';
      process.env.GITHUB_RUN_ID = '1234';
      process.env.GITHUB_EVENT_PATH = `${__dirname}/../__fixtures__/github-payload.json`;

      // eslint-disable-next-line global-require
      const getContext = require('../../lib/context');

      expect(getContext()).toMatchObject({
        ref: process.env.GITHUB_REF,
        sha: process.env.GITHUB_SHA,
        actor: process.env.GITHUB_ACTOR,
        runId: parseInt(process.env.GITHUB_RUN_ID, 10),
        payload: githubPayload,
      });
    });
  });

  describe('bitbucket', () => {
    it('should pull `context` from environment variables', () => {
      // https://support.atlassian.com/bitbucket-cloud/docs/variables-and-secrets/
      process.env.BITBUCKET_COMMIT = 'e32041305b8573674b6f85068ee95591029f58a0';
      process.env.BITBUCKET_STEP_TRIGGERER_UUID = 'domharrington';
      process.env.BITBUCKET_BUILD_NUMBER = '1234';
      process.env.BITBUCKET_REPO_SLUG = 'repo-name';

      // eslint-disable-next-line global-require
      const getContext = require('../../lib/context');

      expect(getContext()).toMatchObject({
        ref: execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim(),
        sha: process.env.BITBUCKET_COMMIT,
        actor: process.env.BITBUCKET_STEP_TRIGGERER_UUID,
        runId: parseInt(process.env.BITBUCKET_BUILD_NUMBER, 10),
        payload: {
          repository: {
            name: process.env.BITBUCKET_REPO_SLUG,
          },
          commits: [
            {
              message: 'test: attempt to fix tests in CI env',
              author: {
                username: process.env.BITBUCKET_STEP_TRIGGERER_UUID,
              },
            },
          ],
        },
      });
    });
  });
});
