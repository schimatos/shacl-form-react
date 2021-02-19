import { isValid } from '../../lib';
import {
  emptyAnd, emptyOr, emptyProperty, emptyXone,
} from '../data';

describe('Testing the is valid utility function', () => {
  it('Should work on empty propery map & empty logical constraints', () => {
    expect(isValid(emptyAnd, {})).toBe(true);
    expect(isValid(emptyOr, {})).toBe(false);
    expect(isValid(emptyXone, {})).toBe(false);
  });
  it('Should work on basic property shapes', () => {
    expect(isValid(emptyProperty, {})).toBe(false);
  });
});
