import { namedNode, quad } from '@rdfjs/data-model';
import type { NamedNode, BlankNode, Literal } from 'rdf-js';
import { addFieldsFactory } from '../../../lib/form/property';
import type { PropertyEntry, Status } from '../../../lib/types';
import { getCounts, getStatus } from '../../../lib/utils';

const emptyState = (
  min = 0,
  max = 0,
  fields: PropertyEntry<NamedNode | BlankNode | Literal | undefined>[] = [],
) => ({
  fields,
  deleted: [] as PropertyEntry[],
  counts: {
    count: {
      min,
      max,
    },
    qualified: {
      min: 0,
      max: 0,
    },
    unQualified: {
      min,
      max,
    },
  },
  key: fields.length,
});

const emptyCount = (): Status => ({
  standard: {
    total: 0,
    valid: 0,
  },
  qualified: {
    total: 0,
    valid: 0,
  },
  unQualified: {
    total: 0,
    valid: 0,
  },
  valid: true,
});

describe('Testing add-fields with a default of at least one field when allowed', () => {
  const addFieldsDefaultOne = addFieldsFactory(true);
  it('Should maintain empty an empty fieldSection when the max count is 0', () => {
    expect(
      addFieldsDefaultOne(emptyState(), emptyCount()),
    ).toEqual(
      emptyState(),
    );
  });

  it('Should add 1 empty field with minCount 0, maxCount > 0', () => {
    expect(
      addFieldsDefaultOne(emptyState(0, 1), emptyCount()),
    ).toEqual(
      emptyState(0, 1, [
        {
          key: 0,
          valid: false,
          qualifiedValid: false,
          qualifiedEnforced: false,
          data: {
            term: undefined,
            annotations: [],
          },
          preloaded: false,
        },
      ]),
    );
  });
});

describe('Testing addFields with default one field turned off', () => {
  const addFieldsDefaultZero = addFieldsFactory(false);
  it('Should make no changes whenever minCount is zero', () => {
    expect(
      addFieldsDefaultZero(emptyState(0, 1), emptyCount()),
    ).toEqual(
      emptyState(0, 1),
    );

    expect(
      addFieldsDefaultZero(emptyState(0, 1, [{
        key: 0,
        valid: false,
        qualifiedValid: false,
        qualifiedEnforced: false,
        data: {
          term: undefined,
          annotations: [],
        },
        preloaded: false,
      }]), emptyCount()),
    ).toEqual(
      emptyState(0, 1, [{
        key: 0,
        valid: false,
        qualifiedValid: false,
        qualifiedEnforced: false,
        data: {
          term: undefined,
          annotations: [],
        },
        preloaded: false,
      }]),
    );
  });
  it('Should make no changes when mincount is 1 and there is already a field', () => {
    const fullState = emptyState(1, 1, [{
      key: 0,
      valid: false,
      qualifiedValid: false,
      qualifiedEnforced: false,
      data: {
        term: undefined,
        annotations: [],
      },
      preloaded: false,
    }]);

    const fullStateWithData = emptyState(1, 1, [{
      key: 7,
      valid: true,
      qualifiedValid: true,
      qualifiedEnforced: true,
      data: {
        term: namedNode('http://example.org#Jesse'),
        annotations: [
          quad(
            namedNode('http://example.org#Jesse'),
            namedNode('http://example.org#predicate'),
            namedNode('http://example.org#object'),
          ),
        ],
      },
      preloaded: true,
    }]);

    expect(
      addFieldsDefaultZero(fullState, getStatus(fullState.fields)),
    ).toEqual(
      addFieldsDefaultZero(fullState, getStatus(fullState.fields)),
    );

    expect(
      addFieldsDefaultZero(fullStateWithData, getStatus(fullStateWithData.fields)),
    ).toEqual(
      addFieldsDefaultZero(fullStateWithData, getStatus(fullStateWithData.fields)),
    );
  });
});
