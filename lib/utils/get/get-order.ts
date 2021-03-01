import { namedNode } from '@rdfjs/data-model';
import type { AnyResource } from 'rdf-object-proxy';
import type {
  FieldType, GroupEntry, LogicalCollection, sh,
} from '../../types';

// TODO: Fix - order can be a decimal value
export function toInteger(num: AnyResource, fallback: number = Infinity): number {
  const int = Number(num);
  return Number.isInteger(int) ? int : fallback;
}

export function getOrderNode(node: sh.NodeShape): number {
  if ('order' in node) {
    return toInteger(node?.order);
  }
  const value: number = Infinity;
  for (const or of node.or) {
    Math.min(getOrderCollection(or), value);
  }
  for (const and of node.and) {
    Math.min(getOrderCollection(and), value);
  }
  for (const xone of node.xone) {
    Math.min(getOrderCollection(xone), value);
  }
  for (const property of node.sh$property) {
    Math.min(getOrderProperty(property), value);
  }
  for (const not of node.not) {
    Math.min(getOrderProperty(not), value);
  }

  return value;
}

export function getOrderProperty(property: sh.PropertyShape): number {
  return toInteger(property?.order);
}

export function getOrderCollection(collection: LogicalCollection): number {
  // TODO [FUTURE]: REMOVE TYPE CASTING
  return Math.min(...collection.list.flatMap((node: sh.Shape) => {
    // TODO: Do properly with on2ts
    if (node.isA(namedNode('http://www.w3.org/ns/shacl#NodeShape'))) {
      return getOrderNode(node as sh.NodeShape);
    } if (node.isA(namedNode('http://www.w3.org/ns/shacl#PropertyShape'))) {
      return getOrderProperty(node as sh.PropertyShape) ?? [];
    }
    throw new Error('Invalid node: expected node shape or property shape');
  }));
}

export function getOrderGroup(field: GroupEntry) {
  const order = toInteger(field.value.order);
  return order === Infinity ? Math.min(...field.fields.map(getOrder)) : order;
}

export function getOrder(field: FieldType): number {
  switch (field.type) {
    case 'group':
      return getOrderGroup(field);
    case 'not':
    case 'property':
      return getOrderProperty(field.value);
    case 'and':
    case 'or':
    case 'xone':
      return getOrderCollection(field.value);
    default: {
      const f: never = field;
      throw new Error(`Invalid field: ${f}`);
    }
  }
}
