const nock = require('nock');
const petstore = require('fs').readFileSync(__dirname + '/__fixtures__/petstore.json', 'utf-8');

nock.disableNetConnect();

const action = require('../');

it('should upload specs to micro', async () => {
  const mock = nock('https://micro.readme.build')
    // We only want to test the oas property on the
    // body because there are a bunch of other
    // things that are undefined on localhost,
    // but populated when running these tests in GitHub CI
    .filteringRequestBody(body => {
      const _body = JSON.parse(body);
      return JSON.stringify({ oas: _body.oas });
    })
    .post('/api/uploadSpec', JSON.stringify({
      oas: {
        fileName: "__tests__/__fixtures__/petstore.json",
        oas: petstore,
      },
    }))
    .reply(200);

  await action({ key: '123456', src: ['__tests__/__fixtures__/petstore.json'] })
  mock.done();
});
