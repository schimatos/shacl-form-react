import type { AnyResource, ProxiedResource } from 'rdf-object-proxy';
import type * as sh from './shacl';

export type PropertyShape = AnyResource & {
  [Symbol.iterator](): Iterator<PropertyShape, any, undefined>;
  group: sh.NodeGroup;
};
export type NodeShape = AnyResource & {
  and: and;
  or: or;
  xone: xone;
  not: not;
  group: sh.NodeGroup;
  sh$property: PropertyShape;
  [Symbol.iterator](): Iterator<NodeShape, any, undefined>
};
export type NodeGroup = ProxiedResource<string> & {
  group: sh.NodeGroup;
  [Symbol.iterator](): Iterator<NodeGroup, any, undefined>
};
export type Shape = PropertyShape | NodeShape;
// TODO: Do this properly once rdf:collection properties are handled properly in on2ts
export type and = AnyResource & {
  list: Shape[]
  group: sh.NodeGroup;
  [Symbol.iterator](): Iterator<and, any, undefined>
};
export type or = AnyResource & {
  list: Shape[]
  group: sh.NodeGroup;
  [Symbol.iterator](): Iterator<or, any, undefined>
};
export type xone = AnyResource & {
  list: Shape[]
  group: sh.NodeGroup;
  [Symbol.iterator](): Iterator<xone, any, undefined>
};
export type not = AnyResource & {
  group: sh.NodeGroup;
  [Symbol.iterator](): Iterator<not, any, undefined>
};
