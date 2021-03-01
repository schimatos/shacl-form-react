import type {
  NamedNode, BlankNode, Literal, Term,
} from 'rdf-js';
import type { Data } from './input';

/**
 * Field entry for a property value
 */
export interface PropertyEntry<T extends Term | undefined = NamedNode | BlankNode | Literal> {
  data: Data<T>
  /**
   * Whether it conforms to the base
   * constraints for the property
   */
  valid: boolean;
  /**
   * Whether to enforce the constraints
   * for a qualified value shape
   */
  qualifiedEnforced: boolean;
  /**
   * Whether it *does* satisfy the constraints
   * for a qualified value shape
   */
  qualifiedValid: boolean;
  /**
   * Pre-loaded whether the data is preloaded
   * (i.e. it already exists within the graph)
   */
  preloaded: boolean;
  /**
   * Used as a key for rendering
   */
  key: number;
}
