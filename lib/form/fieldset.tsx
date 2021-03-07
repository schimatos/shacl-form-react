import React from 'react';
import type { FieldType } from '../types';
import { getLabel, isValid } from '../utils';

function getClassName(field: FieldType, validity: Record<string, boolean>): string {
  return `field-${field.type} valid-${isValid(field, validity)} severity-${
    /[a-z]*$/i.exec(`${field.value.severity}`)?.[0]
  }`;
}

export function Fieldset({
  field,
  validities,
  hidden,
  children,
}: {
  field: FieldType;
  children: React.ReactNode;
  validities: Record<string, boolean>;
  hidden: boolean;
}): JSX.Element {
  const name = getLabel(field);
  return (
    <fieldset
      // id={`${field.value}`}
      title={name}
      name={name}
      hidden={hidden}
      className={getClassName(field, validities)}
    >
      <legend>{name}</legend>
      {children}
    </fieldset>
  );
}
