const getContext = require('../../lib/context');
const githubPayload = require('../__fixtures__/github-payload.json');

describe('getContext()', () => {
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

      expect(getContext()).toMatchObject({
        ref: process.env.GITHUB_REF,
        sha: process.env.GITHUB_SHA,
        actor: process.env.GITHUB_ACTOR,
        runId: parseInt(process.env.GITHUB_RUN_ID, 10),
        payload: githubPayload,
      });

      // Clean up the env after we've modified it
      delete process.env.GITHUB_ACTIONS;
      delete process.env.GITHUB_REF;
      delete process.env.GITHUB_SHA;
      delete process.env.GITHUB_ACTOR;
      delete process.env.GITHUB_RUN_ID;
      delete process.env.GITHUB_EVENT_PATH;
    });
  });
});
