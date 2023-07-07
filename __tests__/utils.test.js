const { isOpenApiJson, isOpenApiYaml, listOas } = require('../utils');

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

describe('listOas()', () => {
  it('should not search in gitignored folders', () => {
    expect(listOas().filter(file => file.startsWith('node_modules'))).toHaveLength(0);
  });

  it('should filter for oas files', () => {
    expect(listOas().filter(file => file.startsWith('package.json'))).toHaveLength(0);
  });
});
