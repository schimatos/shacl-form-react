import React from 'react';
import { namedNode, quad } from '@rdfjs/data-model';
import type { FieldProps } from '../../lib/types';

/**
 * Used to mock the input which will be
 * provided by a package such as LDfields
 */
export function Input(props: FieldProps) {
  return (
    <>
    <input
      aria-label={props.label}
      onChange={() => {
        props.onChange({
          term: namedNode('http://example.org#Jesse'),
          annotations: [quad(
            namedNode('http://example.org#Jesse'),
            namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            namedNode('http://example.org#Person'),
          )],
        });
      }}
    />
    </>
  );
}
