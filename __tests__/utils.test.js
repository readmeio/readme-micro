const { isOpenApiJson, isOpenApiYaml } = require('../utils');

describe('isOpenApiJson()', () => {
  it('should check for `openapi` property', () => {
    expect(isOpenApiJson({ openapi: '3.0.0' })).toBe(true);
  });

  it('should check for `swagger` property', () => {
    expect(isOpenApiJson({ swagger: '2.0.0' })).toBe(true);
  });
});

describe('isOpenApiYaml()', () => {
  it('should check for `openapi` property', () => {
    expect(isOpenApiYaml('openapi: 3.0.0')).toBe(true);
    expect(isOpenApiYaml('openapi: "3.0.0"')).toBe(true);
    expect(isOpenApiYaml("openapi: '3.0.0'")).toBe(true);
  });

  it('should check for `swagger` property', () => {
    expect(isOpenApiYaml('swagger: 2.0.0')).toBe(true);
    expect(isOpenApiYaml('swagger: "2.0.0"')).toBe(true);
    expect(isOpenApiYaml("swagger: '2.0.0'")).toBe(true);
  });
});
