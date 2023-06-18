const getPkgVersion = require('../../lib/getPkgVersion');

const mockPkg = {
  name: 'mock-@readme/micro',
  version: '1.2.0',
};

jest.mock('../../package.json', () => mockPkg, {
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

    it('should correctly grab version', () => {
      return expect(getPkgVersion()).toBe(pkg.version);
    });
  });

  describe('from mock package.json', () => {
    it('should correctly grab version', () => {
      return expect(getPkgVersion()).toBe(mockPkg.version);
    });
  });
});
