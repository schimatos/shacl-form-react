import React, { useReducer } from 'react';
import type { Quad } from 'rdf-js';
import type { FormProps, PropertyData, sh } from '../types';
import { Fields } from './fields';
import { getFields } from '../utils';

type UpdateQuads = Record<string, Record<'insert' | 'delete', Quad[]>>;

interface State {
  validities: Record<string, boolean>,
  updates: Record<string, Record<'insert' | 'delete', Quad[]>>
}

export function Form({ shape, onChange, ...props }:
  Partial<FormProps>
  & { shape: sh.NodeShape, onChange: (e: UpdateQuads) => void, Input: FormProps['Input'] }) {
  const [{ validities, updates }, setValidities] = useReducer(
    (s: State, a: PropertyData) => ({
      validities: { ...s.validities, [`${a.path[a.path.length - 1].value}`]: a.valid },
      updates: {
        ...s.updates,
        [a.path.map((x) => `${x.value}`).join('&')]: { insert: a.insert, delete: a.delete },
      },
    }), { validities: {}, updates: {} },
  );
  // console.log(shape, getFields(shape));
  return (
    // TODO: See if this is better *inside* the reducer
    <form onSubmit={() => { onChange(updates); }} >
      <Fields
        {...props}
        draggable={props.draggable ?? false}
        hidden={props.hidden ?? false}
        onFormChange={props.onFormChange ?? (() => {})}
        onChange={(e) => setValidities(e)}
        validities={validities}
        fields={getFields(shape)}
        path={[]}
      />
      <button>Submit</button>
    </form>
  );
}
