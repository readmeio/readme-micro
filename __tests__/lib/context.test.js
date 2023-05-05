const nock = require('nock');

nock.disableNetConnect();

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

      return expect(getContext()).resolves.toMatchObject({
        ref: process.env.GITHUB_REF,
        sha: process.env.GITHUB_SHA,
        actor: process.env.GITHUB_ACTOR,
        runId: parseInt(process.env.GITHUB_RUN_ID, 10),
        payload: githubPayload,
      });
    });
  });

  describe('bitbucket', () => {
    // Ugh, because our CI environment *is* github actions, we have to
    // nullify the environment variable so that this test passes as a
    // fake bitbucket environment
    beforeEach(() => {
      process.env.GITHUB_ACTIONS = false;
    });

    afterAll(() => {
      process.env.GITHUB_ACTIONS = true;
    });

    it('should pull `context` from environment variables', async () => {
      // https://support.atlassian.com/bitbucket-cloud/docs/variables-and-secrets/
      process.env.BITBUCKET_COMMIT = 'e32041305b8573674b6f85068ee95591029f58a0';
      process.env.BITBUCKET_STEP_TRIGGERER_UUID = '{636fcf11-a096-4b88-99ed-ce185e001fdb}';
      process.env.BITBUCKET_BUILD_NUMBER = '1234';
      process.env.BITBUCKET_REPO_SLUG = 'repo-name';
      process.env.BITBUCKET_BRANCH = 'main';

      // eslint-disable-next-line global-require
      const getContext = require('../../lib/context');

      const mock = nock('https://api.bitbucket.org')
        .get(`/2.0/users/${encodeURIComponent(process.env.BITBUCKET_STEP_TRIGGERER_UUID)}`)
        .reply(200, { display_name: 'Dom H' });

      await expect(getContext()).resolves.toMatchObject({
        ref: `refs/heads/${process.env.BITBUCKET_BRANCH}`,
        sha: process.env.BITBUCKET_COMMIT,
        actor: 'Dom H',
        runId: parseInt(process.env.BITBUCKET_BUILD_NUMBER, 10),
        payload: {
          repository: {
            name: process.env.BITBUCKET_REPO_SLUG,
          },
          // commits: [
          //   {
          //     message: 'test: attempt to fix tests in CI env',
          //     author: {
          //       username: 'Dom H',
          //     },
          //   },
          // ],
        },
      });

      mock.done();
    });

    it('should return with a tag ref if there is a tag', async () => {
      process.env.BITBUCKET_COMMIT = 'e32041305b8573674b6f85068ee95591029f58a0';
      process.env.BITBUCKET_TAG = '1.0.0';
      process.env.BITBUCKET_STEP_TRIGGERER_UUID = '{636fcf11-a096-4b88-99ed-xxxxx}';

      // eslint-disable-next-line global-require
      const getContext = require('../../lib/context');

      const mock = nock('https://api.bitbucket.org')
        .get(`/2.0/users/${encodeURIComponent(process.env.BITBUCKET_STEP_TRIGGERER_UUID)}`)
        .reply(200);

      await expect(getContext()).resolves.toMatchObject({
        ref: `refs/tags/${process.env.BITBUCKET_TAG}`,
      });

      mock.done();
    });

    it('should return with "Unknown User" if the request to fetch user fails', async () => {
      process.env.BITBUCKET_COMMIT = 'e32041305b8573674b6f85068ee95591029f58a0';
      process.env.BITBUCKET_STEP_TRIGGERER_UUID = '{636fcf11-a096-4b88-99ed-ce185e001fdb}';

      // eslint-disable-next-line global-require
      const getContext = require('../../lib/context');

      const mock = nock('https://api.bitbucket.org')
        .get(`/2.0/users/${encodeURIComponent(process.env.BITBUCKET_STEP_TRIGGERER_UUID)}`)
        .reply(404, {
          type: 'error',
          error: {
            message: 'Error',
          },
        });

      await expect(getContext()).resolves.toMatchObject({
        actor: 'Unknown User',
        payload: {
          // commits: [
          //   {
          //     author: {
          //       username: 'Unknown User',
          //     },
          //   },
          // ],
        },
      });
      mock.done();
    });
  });
});
