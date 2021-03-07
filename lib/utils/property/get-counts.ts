import { toInteger } from '../get';
import type { AtomFieldEntry } from '../../types';
import type { Counts } from '../../types/validation-statistics';

/**
 * Gets the minCount, maxCount and differences
 * @param field Field entry
 */
export function getCounts(field: AtomFieldEntry): Counts {
  const count = {
    min: toInteger(field.value.minCount, 0),
    max: toInteger(field.value.maxCount, Infinity),
  };
  const qualified = {
    min: toInteger(field.value.qualifiedMinCount, 0),
    max: toInteger(field.value.qualifiedMaxCount, Infinity),
  };
  return {
    count,
    qualified,
    unQualified: {
      min: Math.max(count.min - qualified.min, 0),
      max: Math.max(count.max - qualified.max, 0),
    },
  };
}
