import type { ActorInitSparql } from '@comunica/actor-init-sparql';
import type {
  NamedNode, BlankNode, Literal, Quad, Term,
} from 'rdf-js';

/**
 * Data that is the input and output from
 * the field.
 */
export interface Data<T extends Term | undefined = NamedNode | BlankNode | Literal> {
  /**
   * The value
   */
  // TODO: Fix type handling for inverse path case.
  term: T;
  /**
   * Additional annotations to insert
   * (e.g. class)
   */
  annotations: Quad[];
}

export interface FieldProps {
  props: Data<undefined | NamedNode | BlankNode | Literal>;
  onChange: (e: Data<undefined | NamedNode | BlankNode | Literal>) => void;
  data: {
    queryEngine?: ActorInitSparql;
    pathFactory?: any;
  };
  constraints: {
    /**
     * Restrictions that apply globally
     */
    restrictions?: { [key in string]?: Record<string, any> };
    /**
     * Field must satisfy *one* of the combinations
     */
    combinations?: { [key in string]?: Record<string, any> }[];
  }
  label?: string;
}

export type Input = (props: FieldProps) => JSX.Element
