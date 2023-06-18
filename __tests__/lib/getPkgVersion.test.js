const getPkgVersion = require('../../lib/getPkgVersion');

jest.mock('../../package.json', () => ({ version: 1.1 }), {
  virtual: true, // needed to mock a JSON file
});

describe('#getPkgVersion()', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  // source adapted from `rdme`:
  // https://github.com/readmeio/rdme/blob/HEAD/__tests__/lib/getPkgVersion.test.ts
  describe('from actual package.json', () => {
    // eslint-disable-next-line global-require
    const pkg = require('../../package.json');

    it('should grab version', () => {
      return expect(getPkgVersion()).toBe(String(pkg.version));
    });
  });

  describe('from mocked package.json', () => {
    it('should parse numeric version from package.json as string', () => {
      return expect(getPkgVersion()).toBe('1.1');
    });
  });
});
