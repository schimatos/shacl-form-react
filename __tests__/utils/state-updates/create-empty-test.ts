import { createEmpty } from '../../../lib/form/property';

describe('Unit testing on the create empty function', () => {
  it('Should default qualifiedEnforced to false', () => {
    expect(createEmpty(0)).toEqual({
      valid: false,
      qualifiedValid: false,
      qualifiedEnforced: false,
      preloaded: false,
      data: {
        term: undefined,
        annotations: [],
      },
      key: 0,
    });
    expect(createEmpty(5)).toEqual({
      valid: false,
      qualifiedValid: false,
      qualifiedEnforced: false,
      preloaded: false,
      data: {
        term: undefined,
        annotations: [],
      },
      key: 5,
    });
  });
  it('Should work with qualifiedEnforced as false', () => {
    expect(createEmpty(0, false)).toEqual({
      valid: false,
      qualifiedValid: false,
      qualifiedEnforced: false,
      preloaded: false,
      data: {
        term: undefined,
        annotations: [],
      },
      key: 0,
    });
    expect(createEmpty(5, false)).toEqual({
      valid: false,
      qualifiedValid: false,
      qualifiedEnforced: false,
      preloaded: false,
      data: {
        term: undefined,
        annotations: [],
      },
      key: 5,
    });
  });
  it('Should work with qualifiedEnforced as true', () => {
    expect(createEmpty(0, true)).toEqual({
      valid: false,
      qualifiedValid: false,
      qualifiedEnforced: true,
      preloaded: false,
      data: {
        term: undefined,
        annotations: [],
      },
      key: 0,
    });
    expect(createEmpty(5, true)).toEqual({
      valid: false,
      qualifiedValid: false,
      qualifiedEnforced: true,
      preloaded: false,
      data: {
        term: undefined,
        annotations: [],
      },
      key: 5,
    });
  });
});
