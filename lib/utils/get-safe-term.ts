import type { NamedNode, BlankNode, Literal } from '@rdfjs/types';
import type { PropertyEntry } from '../types';
import type { Data } from '../types/input';

type Term = NamedNode | BlankNode | Literal
type uTerm = undefined | Term

/**
 * Utility function that asserts that a term is defined
 */
export function getSafeTerm(term: uTerm): Term {
  if (term) {
    return term;
  }
  throw new Error(`Expected term to be BlankNode, NamedNode or Literal. Recieved: ${undefined}`);
}

/**
 * Utility function that asserts that a term in a data type is defined
 */
export function getSafeData(data: Data<uTerm>): Data<Term> {
  return {
    term: getSafeTerm(data.term),
    annotations: data.annotations,
  };
}

/**
 * Utility function that asserts that a term in a property entry is defined
 */
export function getSafePropertyEntry(property: PropertyEntry<uTerm>): PropertyEntry {
  return {
    ...property,
    data: getSafeData(property.data),
  };
}

/**
 * Utility function that asserts that a term in a property entries is defined
 */
export function getSafePropertyEntries(properties: PropertyEntry<uTerm>[]): PropertyEntry[] {
  return properties.map(getSafePropertyEntry);
}
