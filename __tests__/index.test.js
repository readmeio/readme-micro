const { readFileSync } = require('fs');
const path = require('path');

const nock = require('nock');

nock.disableNetConnect();

const action = require('..');
const getPkgVersion = require('../lib/getPkgVersion');

const openapiBundled = readFileSync(path.join(__dirname, './__fixtures__/openapi-file-resolver-bundled.json'), 'utf8');
const openapiFileResolver = readFileSync(path.join(__dirname, '/__fixtures__/openapi-file-resolver.json'), 'utf8');
const petstore = readFileSync(path.join(__dirname, '/__fixtures__/petstore.json'), 'utf8');
const petstoreYaml = readFileSync(path.join(__dirname, '/__fixtures__/petstore.yaml'), 'utf8');
const petstoreYamlSingleQuotes = readFileSync(
  path.join(__dirname, '/__fixtures__/petstore-single-quotes.yaml'),
  'utf8'
);

const mockConfig = {
  key: '123456',
};

/* We only want to test the oas property on the
 * body because there are a bunch of other
 * things that are undefined on localhost,
 * but populated when running these tests in GitHub CI
 */
function filteringRequestBody(body) {
  // eslint-disable-next-line no-underscore-dangle
  const _body = JSON.parse(body);
  return JSON.stringify({ specs: _body.specs });
}

test('should upload specs to micro', async () => {
  const mock = nock('https://micro.readme.com')
    .filteringRequestBody(filteringRequestBody)
    .post(
      '/api/uploadSpec',
      JSON.stringify({
        specs: [
          {
            fileName: '__tests__/__fixtures__/petstore.json',
            oas: JSON.stringify(JSON.parse(petstore)),
            original: petstore,
          },
        ],
      })
    )
    .reply(200);

  await action({ ...mockConfig, src: ['__tests__/__fixtures__/petstore.json'] });
  mock.done();
});

test('should work for yaml specs', async () => {
  const mock = nock('https://micro.readme.com')
    .filteringRequestBody(filteringRequestBody)
    .post(
      '/api/uploadSpec',
      JSON.stringify({
        specs: [
          {
            fileName: '__tests__/__fixtures__/petstore.yaml',
            oas: JSON.stringify(JSON.parse(petstore)),
            original: petstoreYaml,
          },
        ],
      })
    )
    .reply(200);

  await action({ ...mockConfig, src: ['__tests__/__fixtures__/petstore.yaml'] });
  mock.done();
});

test('should work for single quoted yaml specs', async () => {
  const mock = nock('https://micro.readme.com')
    .filteringRequestBody(filteringRequestBody)
    .post(
      '/api/uploadSpec',
      JSON.stringify({
        specs: [
          {
            fileName: '__tests__/__fixtures__/petstore-single-quotes.yaml',
            oas: JSON.stringify(JSON.parse(petstore)),
            original: petstoreYamlSingleQuotes,
          },
        ],
      })
    )
    .reply(200);

  await action({ ...mockConfig, src: ['__tests__/__fixtures__/petstore-single-quotes.yaml'] });
  mock.done();
});

test('should bundle specs with file references', async () => {
  const mock = nock('https://micro.readme.com')
    .filteringRequestBody(filteringRequestBody)
    .post(
      '/api/uploadSpec',
      JSON.stringify({
        specs: [
          {
            fileName: '__tests__/__fixtures__/openapi-file-resolver.json',
            oas: JSON.stringify(JSON.parse(openapiBundled)),
            original: openapiFileResolver,
          },
        ],
      })
    )
    .reply(200, JSON.stringify({ url: 'https://example.com', explanation: 'Lorem ipsum' }));

  await action({ ...mockConfig, src: ['__tests__/__fixtures__/openapi-file-resolver.json'] });
  mock.done();
});

test('should work with no files being present', async () => {
  const mock = nock('https://micro.readme.com')
    .filteringRequestBody(filteringRequestBody)
    .post('/api/uploadSpec', JSON.stringify({ specs: [] }))
    .reply(200);

  await action({ ...mockConfig, src: ['__tests__/__fixtures__/non-existent-file.json'] });
  mock.done();
});

function filteringRequestBodyActionVersion(body) {
  const { specs, actionVersion } = JSON.parse(body);
  return JSON.stringify({ specs, actionVersion });
}

test('should send action package version', async () => {
  const mock = nock('https://micro.readme.com')
    .filteringRequestBody(filteringRequestBodyActionVersion)
    .post('/api/uploadSpec', JSON.stringify({ specs: [], actionVersion: getPkgVersion() }))
    .reply(200);

  await action({ ...mockConfig, src: ['__tests__/__fixtures__/non-existent-file.json'] });
  mock.done();
});
