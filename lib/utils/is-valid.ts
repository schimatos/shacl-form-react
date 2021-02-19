import type { FieldType, sh } from '../types';
import { getFields } from './get';

/**
 * Uses cached validity checks on properties in
 * order to determine whether or not a particular
 * field is considered valid
 * @param field The field to determine the validity of
 * @param map Maps the identifier for a particular
 * propertyShape to whether it is valid or not
 */
export function isValid(field: FieldType, map: Record<string, boolean>): boolean {
  switch (field.type) {
    case 'and':
      return field.value.list.every((f) => everyField(map)(f as sh.NodeShape));
    case 'or': {
      return field.value.list.some((f) => everyField(map)(f as sh.NodeShape));
    }
    case 'xone':
      return (
        field.value.list.reduce(
          (sum, f) => sum + (everyField(map)(f as sh.NodeShape) ? 1 : 0),
          0,
        ) === 1
      );
    case 'property':
      return map[`${field.value}`] === true;
    case 'not':
      // TODO [FUTURE]: Double check
      return map[`${field.value}`] === true;
    case 'group':
      return field.fields.every((f) => isValid(f, map));
    default: {
      const f: never = field;
      throw new Error(`Invalid field: ${f}`);
    }
  }
}

function everyField(map: Record<string, boolean>) {
  return (field: sh.NodeShape) => getFields(field).every((f) => isValid(f, map));
}
