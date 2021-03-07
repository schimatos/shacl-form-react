import type { NamedNode, BlankNode, Literal } from 'rdf-js';
import type { PropertyEntry } from '../types';
import type { Data } from '../types/input';

/**
 * Utility function that asserts that a term is defined
 */
export function getSafeTerm(term: undefined | NamedNode | BlankNode | Literal):
  NamedNode | BlankNode | Literal {
  if (term) {
    return term;
  }
  throw new Error(`Expected term to be BlankNode, NamedNode or Literal. Recieved: ${undefined}`);
}

/**
 * Utility function that asserts that a term in a data type is defined
 */
export function getSafeData(data: Data<undefined | NamedNode | BlankNode | Literal>):
  Data<NamedNode | BlankNode | Literal> {
  return {
    term: getSafeTerm(data.term),
    annotations: data.annotations,
  };
}

/**
 * Utility function that asserts that a term in a property entry is defined
 */
export function getSafePropertyEntry(
  property: PropertyEntry<undefined | NamedNode | BlankNode | Literal>,
): PropertyEntry {
  return {
    ...property,
    data: getSafeData(property.data),
  };
}

/**
 * Utility function that asserts that a term in a property entries is defined
 */
export function getSafePropertyEntries(
  properties: PropertyEntry<undefined | NamedNode | BlankNode | Literal>[],
): PropertyEntry[] {
  return properties.map(getSafePropertyEntry);
}
