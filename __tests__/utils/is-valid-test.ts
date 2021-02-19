import { isValid } from '../../lib';
import { emptyAnd, emptyOr, emptyXone } from '../data';

describe('Testing the is valid utility function', () => {
  it('Should work on empty propery map & empty logical constraints', () => {
    expect(isValid(emptyAnd, {})).toBe(true);
    expect(isValid(emptyOr, {})).toBe(true);
    expect(isValid(emptyXone, {})).toBe(true);
  });
});
