import { namedNode } from '@rdfjs/data-model';
import type { FieldEntry, sh } from '../../../lib';

// TODO [FUTURE]: REMOVE TYPE CASTIN IN TEST
const emptyListed = {
  list: [],
  [Symbol.iterator]() {
    return [emptyListed][Symbol.iterator]();
  },
};

export const emptyAnd: FieldEntry<'and', sh.and> = {
  type: 'and',
  value: emptyListed as unknown as sh.and,
  // @ts-ignore
  parent: undefined,
};

export const emptyOr: FieldEntry<'or', sh.or> = {
  type: 'or',
  value: emptyListed as unknown as sh.or,
  // @ts-ignore
  parent: undefined,
};

export const emptyXone: FieldEntry<'xone', sh.xone> = {
  type: 'xone',
  value: emptyListed as unknown as sh.or,
  // @ts-ignore
  parent: undefined,
};

export const emptyProperty: FieldEntry<'property', sh.PropertyShape> = {
  type: 'property',
  value: {
    // @ts-ignore
    path: namedNode('http://example.org/myPath'),
  },
  // @ts-ignore
  parent: undefined,
};
