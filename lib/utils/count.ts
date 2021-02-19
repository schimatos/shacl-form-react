/**
 * Counts the number of elements in an array that
 * satisfy a particular propery
 * @param array Arbitrary array
 * @param testFunc Function to test values in array
 */
export function count<T>(array: T[], testFunc: (value: T) => boolean): number {
  return array.reduce((t, value) => t + (testFunc(value) ? 1 : 0), 0);
}
