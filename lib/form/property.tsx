import React, { useReducer } from 'react';
import type { NamedNode, BlankNode, Literal } from 'rdf-js';
import { copy } from 'copy-anything';
import type { AnyResource } from 'rdf-object-proxy';
import type { Resource } from 'rdf-object';
import { termToString } from 'rdf-string-ttl';
import deindent from 'deindent';
import type {
  ActorInitSparql,
  IQueryResult,
} from '@comunica/actor-init-sparql';
import { useAsyncEffect } from '@jeswr/use-async-effect';
import type {
  RenderFieldProps,
  AtomFieldEntry,
  PropertyEntry,
  Counts,
  Status,
} from '../types';
import type { Data } from '../types/input';
import { getCounts } from '../utils/property/get-counts';
import { getStatus } from '../utils/property/get-status';
import { getLabel, getSafePropertyEntries, pathToSparql } from '../utils';
import { Fieldset } from './fieldset';

interface State {
  fields: PropertyEntry<NamedNode | BlankNode | Literal | undefined>[];
  deleted: PropertyEntry[];
  counts: Counts;
  key: number;
}

// TODO: FIX UPDATE BEING INTERNAL AND EXTERNAL

/**
 * Actions which are caused by changes internal to
 * the component (i.e. changes emitted by the ) fields
 * themselves
 */
type InternalAction =
  | {
      type: 'delete';
      index?: number;
    }
  | {
      type: 'unlock';
      index: number;
    }
  | {
      type: 'update';
      index: number;
      data: Data<BlankNode | Literal | NamedNode | undefined>;
    };

/**
 * Actions which are caused by external events
 * (i.e. updates to the data)
 */
type ExternalAction =
  | {
      type: 'delete';
      index?: number;
    }
  | {
      type: 'unlock';
      index: number;
    }
  | {
      type: 'update';
      index: number;
      data: Data<BlankNode | Literal | NamedNode | undefined>;
    }
  | {
      type: 'dataChange';
      values: ValueData[];
    };

type Action = InternalAction | ExternalAction;

export function createEmpty(
  key: number,
  qualifiedEnforced = false,
): PropertyEntry<undefined | NamedNode | BlankNode | Literal> {
  return {
    valid: false,
    qualifiedValid: false,
    qualifiedEnforced,
    preloaded: false,
    data: {
      term: undefined,
      annotations: [],
    },
    key,
  };
}

function createLoaded(
  key: number,
  term: undefined | NamedNode | BlankNode | Literal = undefined,
  preloaded = true,
): PropertyEntry<undefined | NamedNode | BlankNode | Literal> {
  return {
    valid: false,
    qualifiedValid: false,
    qualifiedEnforced: false,
    preloaded,
    data: {
      term,
      annotations: [],
    },
    key,
  };
}

/**
 * This is a helper function for update/delete actions. Removes a field from
 * the field list, and if the field marked as preloaded (i.e. already exists within the graph)
 * then adds to the deleted array (so that we can DELETE it when the form is submitted).
 * @param state The current state of the reducer
 * @param a The action being applied to the reducer
 */
function toDeletion(
  state: State,
  a: InternalAction,
): { state: State; index: number } {
  const s = copy(state);
  const index = a.index ?? s.fields.length - 1;
  const field = s.fields[index];
  if (field.preloaded) {
    const { term } = field.data;
    // TODO [FUTURE]: Enforce this assumption using types
    if (term !== undefined) {
      s.deleted.push({
        ...field,
        data: {
          term,
          annotations: field.data.annotations,
        },
      });
    } else {
      throw new Error('Should not be deleting undefined term');
    }
    s.fields[index].preloaded = false;
  }
  return { state: s, index };
}

/**
 * A function that updates the array of field entries in some way
 */
type Updater = (
  state: State,
  status: Status
) => State;

/**
 * Updates the qualified value fields by assigning fields
 * that *satisfy* the qualifiedValue constraint, but do not
 * have qualifiedEnforced = true, until
 * counts.qualified.min = status.qualified.valid
 * @param fields The fields to be updated
 * @param counts The minCount/maxCount data
 * @param status Validity status statistics
 */
export function enforceQualified(
  state: State,
  status: Status,
): State {
  const fieldCopy = copy(state.fields);
  const diff = state.counts.qualified.min - status.qualified.valid;
  let corrected = 0;
  for (const field of fieldCopy) {
    if (diff < corrected) {
      break;
    }
    if (field.qualifiedValid && !field.qualifiedEnforced) {
      corrected += 1;
      field.qualifiedEnforced = true;
    }
  }
  return { ...state, fields: fieldCopy };
}

/**
 * TODO [FUTURE]: Apply a priority to empty/filled/valid fields.
 * Updates the fields so that excessive qualifiedEnforced
 * constraints are relaxed.
 * Note: We relax from the back of the list and work towards
 * the front until status.qualified.total = counts.qualified.min
 * @param fields The fields to be updated
 * @param counts The minCount/maxCount data
 * @param status Validity status statistics
 */
export function relaxQualified(
  state: State,
  status: Status,
): State {
  const fieldCopy = copy(state.fields);
  // The number of unecessarily enforced qualified constraint fields
  let unnecessarilyEnforced = status.qualified.total - state.counts.qualified.min;
  for (
    let i = fieldCopy.length - 1;
    i >= 0 && unnecessarilyEnforced > 0;
    i -= 1
  ) {
    const { qualifiedEnforced, qualifiedValid } = fieldCopy[i];
    if (qualifiedEnforced && !qualifiedValid) {
      fieldCopy[i].qualifiedEnforced = true;
      unnecessarilyEnforced -= 1;
    }
  }
  return { ...state, fields: fieldCopy };
}

/**
 * @param atLeastOne Whether there should be at
 * least one field even if the minCount is zero
 * (this is ignored if the maxCount is also zero)
 */
export function addFieldsFactory(atLeastOne: boolean = true) {
  /**
   * Adds fields to make up the minCount of the field
   * @param fields The fields to be updated
   * @param counts The minCount/maxCount data
   * @param status Validity status statistics
   */
  return function addFields(
    state: State,
    status: Status,
  ): State {
    let fieldCopy: PropertyEntry<
      NamedNode | BlankNode | Literal | undefined>[] = copy(state.fields);
    const qualified = Math.max(
      state.counts.qualified.min - status.qualified.total,
      0,
    );
    const unQualified = Math.max(
      state.counts.unQualified.min - (status.standard.total - status.qualified.total),
      0,
    );
    fieldCopy = [
      ...fieldCopy,
      // DO NOT USE .fill HERE AS THIS WILL CAUSE THE SAME OBJECT
      // TO BE REFERENCED BY MULTIPLE ENTRIES
      ...Array(qualified).fill(undefined).map((_, i) => createEmpty(state.key + i, true)),
      ...Array(unQualified).fill(undefined).map((_, i) => createEmpty(state.key + qualified + i)),
    ];
    if (fieldCopy.length === 0 && atLeastOne && state.counts.count.max > 0) {
      return {
        ...state,
        fields: [createEmpty(state.key)],
        key: state.key + 1,
      };
    }
    return {
      ...state,
      fields: fieldCopy,
      key: state.key + qualified + unQualified,
    };
  };
}

/**
 * Runs a set of updaters over the fields.
 * @param updaters A set of field updaters
 * (order in array determines the order in which they are run)
 */
function runFieldUpdatesFactory(updaters: Updater[]) {
  return function runFieldUpdates(
    state: State,
  ) {
    return updaters.reduce(
      (state, updater) => updater(state, getStatus(state.fields)),
      state,
    );
  };
}

interface ValueData {
  value: any;
  temporary: boolean;
}

/**
 * The data 'provider' may itself be a promise and hence we have to resolve it
 * first
 * TODO: Make the types around this stricter
 */
async function getValues(
  data: any,
  path: AnyResource,
  queryEngine?: ActorInitSparql,
): Promise<ValueData[]> {
  if (!data) {
    return [];
  }
  return data[pathToSparql(path)].toArray(async (value: any) => {
    // Long term this is probably better solved with a SPARQL* annotation
    const query = deindent`
        ASK {
          GRAPH <http://schimatos/temporary-graph> {
            ${termToString(data)} ${pathToSparql(path)} ${termToString(value)}
          }
        }`;

    const result: IQueryResult = await queryEngine?.query(query) ?? {
      type: 'boolean',
      booleanResult: Promise.resolve(false),
    };

    if (result.type !== 'boolean') {
      throw new Error('Boolean result expected');
    }

    return {
      value,
      temporary: result.booleanResult,
    };
  });
}

/**
 * Gets all of the data for fields that was previously defined
 * in the graph
 * @param fields The current state
 */
function getPredefined(fields: State): PropertyEntry[] {
  return getSafePropertyEntries([
    ...fields.fields.filter((value) => value.preloaded),
    ...fields.deleted.filter((value) => value.preloaded),
  ]);
}

/**
 * Tests for a change in the data graph that affects
 * values related to this field
 * @param fields
 * @param values
 */
function isDataValueChange(state: State, values: ValueData[]): boolean {
  const fields = getPredefined(state);
  if (fields.length !== values.length) {
    return true;
  }
  // TODO [FUTURE]: This unecessarily has an theta(n^2) complexity
  // Can be theta(n) under the assumption that the order of fields and values
  // matches is approximately the same, and deleting values as they are found
  for (const field of fields) {
    if (!values.some((value) => value.value.equals(field.data.term))) {
      return true;
    }
  }
  return false;
}

export const runStateUpdates = runFieldUpdatesFactory([
  enforceQualified,
  relaxQualified,
  addFieldsFactory(true),
]);

export function init({ values, field }: {values: ValueData[], field: AtomFieldEntry}) {
  const counts = getCounts(field);
  return runStateUpdates({
    fields: values.map((value, i) => createLoaded(i, value.value, !value.temporary)),
    deleted: [],
    counts,
    key: values.length,
  });
}

function reducerFactory(field: AtomFieldEntry) {
  return function reducer(s: State, a: Action): State {
    switch (a.type) {
      case 'delete': {
        const { state, index } = toDeletion(s, a);
        return runStateUpdates({
          ...state,
          fields: [
            ...state.fields.slice(0, index),
            ...state.fields.slice(index + 1),
          ],
        });
      }
      case 'unlock': {
        return runStateUpdates(toDeletion(s, a).state);
      }
      case 'update': {
        return s;
      }
      case 'dataChange': {
        if (isDataValueChange(s, a.values)) {
          return init({ values: a.values, field });
        }
        return s;
      }
      default: {
        const action: never = a;
        throw new Error(`Invalid action: ${action}`);
      }
    }
  };
}

export function Property({
  data,
  Input,
  ...props
}: RenderFieldProps<AtomFieldEntry>) {
  const label = getLabel(props.field);
  const [state, dispatch] = useReducer(
    reducerFactory(props.field),
    { values: [], field: props.field },
    init,
  );
  useAsyncEffect(async () => {
    const values = await getValues(data, props.field.value.path, props.queryEngine);
    dispatch({
      type: 'dataChange',
      values,
    });
  }, [data]);
  const { fields } = state;
  return (
    <Fieldset {...props}>
      {fields.map((f, index) => (
        <Input
        key={f.key}
        props={f.data}
          onChange={(data) => {
            dispatch({ type: 'update', index, data });
          }}
          data={{
            pathFactory: props.pathFactory,
            queryEngine: props.queryEngine,
          }}
          constraints={
            {
              restrictions: getRestrictions(props.field.value.property),
            }
          }
          label={label}
        />
      ))}
    </Fieldset>
  );
}

// TODO [FUTURE]: Preprocess this fully (flags should be combined with pattern etc.)
function getRestrictions(property: Record<string, Resource>) {
  const restrictions: Record<string, any> = {};
  for (const p in property) {
    if (property[p].term.termType === 'Literal') {
      restrictions[/[a-z]+$/i.exec(p)?.[0] ?? ''] = property[p].term.value;
    }
  }
  return restrictions;
}
