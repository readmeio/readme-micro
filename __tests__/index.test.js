const nock = require('nock');
const petstore = require('./__fixtures__/petstore.json');

nock.disableNetConnect();

const action = require('../');

it('should upload specs to micro', async () => {
  const mock = nock('https://micro.readme.build')
    // Removing some properties on the body because
    // these are undefined on localhost, but populated
    // when running these tests in GitHub CI
    .filteringRequestBody(body => {
      const _body = JSON.parse(body);
      delete _body.payload;
      delete _body.runId;
      return JSON.stringify(_body);
    })
    .post('/api/uploadSpec', JSON.stringify({
      oas: {
        fileName: "__tests__/__fixtures__/petstore.json",
        oas: petstore,
      },
    }))
    .reply(200, JSON.stringify({ url: 'https://example.com', explanation: 'Lorem ipsum' }));

  await action({ key: '123456', src: ['__tests__/__fixtures__/petstore.json'] })
  mock.done();
});
