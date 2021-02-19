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
  value: emptyListed as undefined as sh.and,
  parent: undefined,
};

export const emptyOr: FieldEntry<'or', sh.or> = {
  type: 'or',
  value: emptyListed as undefined as sh.or,
  parent: undefined,
};

export const emptyXone: FieldEntry<'xone', sh.xone> = {
  type: 'xone',
  value: emptyListed as undefined as sh.or,
  parent: undefined,
};
