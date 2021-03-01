import React from 'react';
import { useState } from '@jeswr/use-state';
import type { RenderFieldProps, CollectionFieldEntry, sh } from '../types';
import { getFields, getLabel, isValid } from '../utils';
import { Fieldset } from './fieldset';
import { Fields } from './fields';

export function Collection({
  field,
  selectPanel = field.type !== 'and',
  panelDescription = field.type !== 'and',
  ...props
}: RenderFieldProps<CollectionFieldEntry>) {
  const { list } = field.value;
  const [selection, setSelection] = useState(list.length > 0 ? `${list[0]}` : 'all');
  const name = getLabel(field);
  return (
    <Fieldset {...props} field={field}>
      {selectPanel && (
        <select
          name={`select ${name}`}
          aria-label={'Field selection'}
          id={`${field.value}-select`}
          onChange={(e) => {
            setSelection(e.target.value);
          }}
          value={selection}
        >
          {field.value.list.map((shape) => (
            <option value={`${shape}`} key={`${shape}`}>
              {getFields(shape as sh.NodeShape)
                .every((f) => isValid(f, props.validities)) ? '\u2714' : '\u274c'}
              {getFields(shape as sh.NodeShape).map(getLabel).join('')}
            </option>
          ))}
          <option value='all'>{'Show all'}</option>
        </select>
      )}
      {panelDescription
        ? {
          or: 'At least one must hold true',
          xone: 'Exactly one must hold true',
          and: 'All must hold true',
        }[field.type]
        : ''}
      {field.value.list.map((shape) => (
        <Fields
          {...props}
          key={`${shape}`}
          fields={getFields(shape as sh.NodeShape)}
          hidden={selection !== 'all' && selection !== `${shape}` && selectPanel}
        />
      ))}
    </Fieldset>
  );
}
