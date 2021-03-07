import { count } from '../../lib/utils/count';

describe('Testing the count function', () => {
  it('Should return zero for all empty arrays regardless of function', () => {
    expect(count([], (x) => x)).toBe(0);
    expect(count([], () => true)).toBe(0);
    expect(count([], () => false)).toBe(0);
  });
  it('Should return the length of the array when the function is () => true', () => {
    expect(count([], () => true)).toBe(0);
    expect(count([0], () => true)).toBe(1);
    expect(count([1, 2, 3, 4, 5], () => true)).toBe(5);
    expect(count([true, true, true, true, true], () => true)).toBe(5);
    expect(count([true, 3, 'hello', true, true], () => true)).toBe(5);
    expect(count([undefined], () => true)).toBe(1);
  });
  it('Should return 0 when the function is () => false', () => {
    expect(count([], () => false)).toBe(0);
    expect(count([0], () => false)).toBe(0);
    expect(count([1, 2, 3, 4, 5], () => false)).toBe(0);
    expect(count([true, true, true, true, true], () => false)).toBe(0);
    expect(count([true, 3, 'hello', true, true], () => false)).toBe(0);
    expect(count([undefined], () => false)).toBe(0);
  });
  it('Should work on more advanced testcases', () => {
    expect(count([true, false, true, true, false], (x) => x)).toBe(3);
    expect(count([
      { term: 'h' },
      { term: true },
      { term: 'hello' },
      { term: 'goodbye' },
      { term: 'boop' },
    ], (x) => x.term === 'hello')).toBe(1);
    expect(count([1, 2, 3, 4, 5], (x) => x % 2 === 0)).toBe(2);
  });
});
