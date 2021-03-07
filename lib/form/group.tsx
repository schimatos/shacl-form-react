import React from 'react';
import type { RenderFieldProps, GroupEntry } from '../types';
import { Fields } from './fields';
import { Fieldset } from './fieldset';

export function Group(props: RenderFieldProps<GroupEntry>) {
  return (
    <Fieldset {...props}>
      <Fields {...props} fields={props.field.fields} />
    </Fieldset>
  );
}
