import type { Status, PropertyEntry } from '../../types';
import { count } from '../count';

export function getStatus(fields: PropertyEntry[]): Status {
  const standard = {
    total: fields.length,
    valid: count(fields, (field) => field.valid),
  };
  const qualified = {
    total: count(fields, (field) => field.qualifiedEnforced),
    valid: count(fields, (field) => field.qualifiedEnforced && field.qualifiedValid),
  };
  return {
    standard,
    qualified,
    valid: standard.total === standard.valid && qualified.total === qualified.valid,
  };
}
