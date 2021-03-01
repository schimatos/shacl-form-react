import { enforceQualified } from '../../../lib/form/property';
import type { Status } from '../../../lib/types';

const emptyState = () => ({
  fields: [],
  deleted: [],
  counts: {
    count: {
      min: 0,
      max: Infinity,
    },
    qualified: {
      min: 0,
      max: 0,
    },
    unQualified: {
      min: 0,
      max: Infinity,
    },
  },
  key: 0,
});

const emptyStatus = (): Status => ({
  qualified: {
    total: 0,
    valid: 0,
  },
  standard: {
    total: 0,
    valid: 0,
  },
  unQualified: {
    total: 0,
    valid: 0,
  },
  valid: true,
});

describe('Unit tests for the enforce qualified function', () => {
  it('Should make no changes whenever the array of fields is empty', () => {
    expect(enforceQualified(emptyState(), emptyStatus())).toEqual(emptyState());
  });
});
