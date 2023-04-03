const nock = require('nock');
const petstore = require('./__fixtures__/petstore.json');

nock.disableNetConnect();

const action = require('../');

it('should upload specs to micro', async () => {
  const mock = nock('https://micro.readme.build')
    .post('/api/uploadSpec', JSON.stringify({
      oas: {
        fileName: "__tests__/__fixtures__/petstore.json",
        oas: petstore,
      },
      runId: null,
      payload: {},
    }))
    .reply(200, JSON.stringify({ url: 'https://example.com', explanation: 'Lorem ipsum' }));

  await action({ key: '123456', src: ['__tests__/__fixtures__/petstore.json'] })
  mock.done();
});
