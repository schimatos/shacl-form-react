import React from 'react';
import type { RenderFieldProps } from '../types';
import { Group } from './group';
import { Collection } from './collection';
import { Property } from './property';

export function Field(props: RenderFieldProps) {
  const { field } = props;
  switch (field.type) {
    case 'group':
      return <Group {...props} field={field} />;
    case 'not':
    case 'property':
      return <Property {...props} field={field} />;
    case 'and':
    case 'or':
    case 'xone':
      // Note sh:or ( [ sh:property _:b61064 ] [ sh:property _:b60054 ] ) ;
      // works but sh:or ( _:b61064 _:b60054 ) ; does not
      return <Collection {...props} field={field} />;
    default: {
      const f: never = field;
      throw new Error(`Invalid field: ${f}`);
    }
  }
}
