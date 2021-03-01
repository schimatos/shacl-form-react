import type { AnyResource } from 'rdf-object-proxy';
import type { FieldType, sh } from '../../types';
import { getFields } from './get-fields';
import { pathToSparql } from '../traverse-path';

function getName(resource: AnyResource, fragmentOnly = false): string | undefined {
  for (const elem of resource) {
    if (elem.type !== 'BlankNode') {
      return fragmentOnly ? /\w+/.exec(/\w+\W*$/i.exec(`${elem}`)?.[0] ?? '')?.[0] : `${elem}`;
    }
  }
  return undefined;
}

// function writeGroupSection(resource: ProxiedResource<string>) {
//   const names = getFields(resource).map(getNameField);
//   return names.length > 1 ? `(${names.join(' ')})` : names.join(' ')
// }

export function getLabel(field: FieldType): string {
  const fieldName = getName(field.value.name)
    ?? getName(field.value.label)
    ?? getName(field.value.path.label)
    ?? getName(field.value.path, true)
    ?? getName(field.value, true); // ? /[a-z]+([^a-z]*)/i.exec(getName(field.value)) : undefined;
  if (fieldName) {
    return fieldName;
  }
  // TODO: Get this working in full
  // return 'TODO'
  switch (field.type) {
    // case 'group':
    //   return;
    // case 'not':
    //   return;
    // case 'property':
    //   return;
    case 'and':
      return field.value.list.map(
        // TODO: FIX - Type casting here is incorrect. Property shapes
        // *are* allowed here
        (x) => `(${getFields(x as sh.NodeShape).map(getLabel).join(' ')})`,
      ).join(' AND ');
    case 'or':
      return field.value.list.map(
        (x) => `(${getFields(x as sh.NodeShape).map(getLabel).join(' ')})`,
      ).join(' OR ');
    case 'xone':
      return field.value.list.map(
        (x) => `(${getFields(x as sh.NodeShape).map(getLabel).join(' ')})`,
      ).join(' XONE ');
    // TODO: Display this better
    default: return pathToSparql(field.value.path);
  }
}

// export function getOrderProperty(property: ProxiedResource<string>): number {
//   return toInteger(property?.order);
// }

// export function getNameCollection(collection: Field[], conjunction: string): string {
//   return collection.map(field => getNameField(field)).join(` ${conjunction} `)
// }

// export function getOrderGroup(field: Group) {
//   return Math.min(...field.fields.map(getOrder))
// }

// export function getOrder(field: Field): number {
//   switch (field.type) {
//     case 'group':
//       return getOrderGroup(field);
//     case 'not':
//     case 'property':
//       return getOrderProperty(field.value);
//     case 'and':
//     case 'or':
//     case 'xone':
//       return getOrderCollection(field.value);
//     default: {
//       const f: never = field;
//       throw new Error(`Invalid field: ${f}`)
//     }
//   }
// }
