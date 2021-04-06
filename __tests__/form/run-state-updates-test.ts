import { runStateUpdates } from '../../lib/form/property';

const counts = (min = 0, max = 5) => ({
  count: {
    min,
    max,
  },
  qualified: {
    min,
    max: Infinity,
  },
  unQualified: {
    min,
    max,
  },
});

describe('Testing on empty fields and deleted', () => {
  it('Should automatically add first field by default', () => {
    expect(runStateUpdates({
      counts: {
        count: {
          min: 0,
          max: Infinity,
        },
        qualified: {
          min: 0,
          max: Infinity,
        },
        unQualified: {
          min: 0,
          max: 5,
        },
      },
      key: 0,
      fields: [],
      deleted: [],
      subject: undefined,
      predicate: undefined,
    })).toEqual({
      counts: {
        count: {
          min: 0,
          max: Infinity,
        },
        qualified: {
          min: 0,
          max: Infinity,
        },
        unQualified: {
          min: 0,
          max: 5,
        },
      },
      key: 1,
      fields: [{
        data: {
          term: undefined,
          annotations: [],
        },
        key: 0,
        preloaded: false,
        qualifiedEnforced: false,
        valid: false,
        qualifiedValid: false,
      }],
      deleted: [],
      subject: undefined,
      predicate: undefined,
    });
  });
  it('Should not make any changes if maxcount is 0', () => {
    expect(runStateUpdates({
      counts: counts(0, 0),
      key: 0,
      fields: [],
      deleted: [],
      subject: undefined,
      predicate: undefined,
    })).toEqual({
      counts: counts(0, 0),
      key: 0,
      fields: [],
      deleted: [],
      subject: undefined,
      predicate: undefined,
    });
  });
  it('Should add the first field by default', () => {
    expect(runStateUpdates({
      counts: {
        count: {
          min: 0,
          max: 1,
        },
        qualified: {
          min: 0,
          max: 0,
        },
        unQualified: {
          min: 0,
          max: 1,
        },
      },
      key: 0,
      fields: [],
      deleted: [],
      subject: undefined,
      predicate: undefined,
    })).toEqual({
      counts: {
        count: {
          min: 0,
          max: 1,
        },
        qualified: {
          min: 0,
          max: 0,
        },
        unQualified: {
          min: 0,
          max: 1,
        },
      },
      key: 1,
      fields: [{
        data: {
          term: undefined,
          annotations: [],
        },
        valid: false,
        qualifiedEnforced: false,
        qualifiedValid: false,
        preloaded: false,
        key: 0,
      }],
      deleted: [],
      subject: undefined,
      predicate: undefined,
    });
  });
});
