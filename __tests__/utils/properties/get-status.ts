import { getStatus } from '../../../lib/utils';

describe('Unit tests on the get status function', () => {
  it('Should work on empty fields', () => {
    expect(
      getStatus([]),
    ).toEqual({
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
  });
});
