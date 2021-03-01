import type { NamedNode, BlankNode, Literal } from 'rdf-js';
import type { Status, PropertyEntry } from '../../types';
import { count } from '../count';

export function getStatus(
  fields: PropertyEntry<NamedNode | BlankNode | Literal | undefined>[],
): Status {
  const standard = {
    total: fields.length,
    valid: count(fields, (field) => field.valid),
  };
  const qualified = {
    total: count(fields, (field) => field.qualifiedEnforced),
    // TODO: Double check last && condition
    valid: count(fields, (field) => field.qualifiedEnforced && field.qualifiedValid && field.valid),
  };
  return {
    standard,
    qualified,
    unQualified: {
      total: standard.total - qualified.total,
      valid: standard.valid - qualified.valid,
    },
    valid: standard.total === standard.valid && qualified.total === qualified.valid,
  };
}
