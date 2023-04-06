const nock = require('nock');
const petstore = require('./__fixtures__/petstore.json');
const openapiBundled = require('./__fixtures__/openapi-file-resolver-bundled.json');

nock.disableNetConnect();

const action = require('../');

/* We only want to test the oas property on the
 * body because there are a bunch of other
 * things that are undefined on localhost,
 * but populated when running these tests in GitHub CI
 */
function filteringRequestBody(body) {
  const _body = JSON.parse(body);
  return JSON.stringify({ oas: _body.oas });
}

it('should upload specs to micro', async () => {
  const mock = nock('https://micro.readme.build')
    .filteringRequestBody(filteringRequestBody)
    .post('/api/uploadSpec', JSON.stringify({
      oas: {
        fileName: "__tests__/__fixtures__/petstore.json",
        oas: JSON.stringify(petstore),
      },
    }))
    .reply(200);

  await action({ key: '123456', src: ['__tests__/__fixtures__/petstore.json'] })
  mock.done();
});

it.todo('should work for yaml specs');

it("should bundle specs with file references", async () => {
  const mock = nock('https://micro.readme.build')
    .filteringRequestBody(filteringRequestBody)
    .post('/api/uploadSpec', JSON.stringify({
      oas: {
        fileName: "__tests__/__fixtures__/openapi-file-resolver.json",
        oas: JSON.stringify(openapiBundled),
      },
    }))
    .reply(200, JSON.stringify({ url: 'https://example.com', explanation: 'Lorem ipsum' }));

  await action({ key: '123456', src: ['__tests__/__fixtures__/openapi-file-resolver.json'] })
  mock.done();
});
