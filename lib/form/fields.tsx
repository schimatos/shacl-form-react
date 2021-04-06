import React from 'react';
import type { RenderFieldsProps } from '../types';
import { getOrder } from '../utils';
import { Field } from './field';

export function Fields({ path = [], fields, ...props }: RenderFieldsProps) {
  return (
    <>
      {fields
        .sort((a, b) => getOrder(a) - getOrder(b))
        .map((field, i) => (
          <Field
            {...props}
            key={[...path, field].map((p) => `${p.type}&${p.value}&${i}`).join('-')}
            path={[...path, field]}
            field={field}
          />
        ))}
    </>
  );
}
