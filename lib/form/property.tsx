import React, { useReducer } from 'react';
import type { NamedNode, BlankNode, Literal } from 'rdf-js';
import { copy } from 'copy-anything';
import type { AnyResource } from 'rdf-object-proxy';
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
import { getSafePropertyEntries, pathToSparql } from '../utils';

interface State {
  fields: PropertyEntry<NamedNode | BlankNode | Literal | undefined>[];
  deleted: PropertyEntry[];
}

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
      data: Data;
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
      data: Data;
    }
  | {
      type: 'dataChange';
      values: ValueData[];
    };

type Action = InternalAction | ExternalAction;

function createEmpty(
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
  fields: PropertyEntry<NamedNode | BlankNode | Literal | undefined>[],
  counts: Counts,
  status: Status
) => PropertyEntry<NamedNode | BlankNode | Literal | undefined>[];

/**
 * Updates the qualified value fields by assigning fields
 * that *satisfy* the qualifiedValue constraint, but do not
 * have qualifiedEnforced = true, until
 * counts.qualified.min = status.qualified.valid
 * @param fields The fields to be updated
 * @param counts The minCount/maxCount data
 * @param status Validity status statistics
 */
function enforceQualified(
  fields: PropertyEntry<NamedNode | BlankNode | Literal | undefined>[],
  counts: Counts,
  status: Status,
): PropertyEntry<NamedNode | BlankNode | Literal | undefined>[] {
  const fieldCopy = copy(fields);
  const diff = counts.qualified.min - status.qualified.valid;
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
  return fieldCopy;
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
function relaxQualified(
  fields: PropertyEntry<NamedNode | BlankNode | Literal | undefined>[],
  counts: Counts,
  status: Status,
): PropertyEntry<NamedNode | BlankNode | Literal | undefined>[] {
  const fieldCopy = copy(fields);
  // The number of unecessarily enforced qualified constraint fields
  let unnecessarilyEnforced = status.qualified.total - counts.qualified.min;
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
  return fieldCopy;
}

/**
 * @param atLeastOne Whether there should be at
 * least one field even if the minCount is zero
 * (this is ignored if the maxCount is also zero)
 */
function addFieldsFactory(atLeastOne: boolean = true) {
  /**
   * Adds fields to make up the minCount of the field
   * @param fields The fields to be updated
   * @param counts The minCount/maxCount data
   * @param status Validity status statistics
   */
  return function addFields(
    fields: PropertyEntry<NamedNode | BlankNode | Literal | undefined>[],
    counts: Counts,
    status: Status,
  ): PropertyEntry<NamedNode | BlankNode | Literal | undefined>[] {
    let fieldCopy: PropertyEntry<NamedNode | BlankNode | Literal | undefined>[] = copy(fields);
    const qualified = Math.max(
      counts.qualified.min - status.qualified.total,
      0,
    );
    const unQualified = Math.max(
      counts.unQualified.min - (status.standard.total - status.qualified.total),
      0,
    );
    fieldCopy = [
      ...fieldCopy,
      // DO NOT USE .fill HERE AS THIS WILL CAUSE THE SAME OBJECT
      // TO BE REFERENCED BY MULTIPLE ENTRIES
      ...Array(qualified).map(() => createEmpty(true)),
      ...Array(unQualified).map(() => createEmpty()),
    ];
    if (fieldCopy.length === 0 && atLeastOne && counts.count.max > 0) {
      return [createEmpty()];
    }
    return fieldCopy;
  };
}

/**
 * Runs a set of updaters over the fields.
 * @param updaters A set of field updaters
 * (order in array determines the order in which they are run)
 */
function runFieldUpdatesFactory(updaters: Updater[]) {
  return function runFieldUpdates(
    fields: PropertyEntry<NamedNode | BlankNode | Literal | undefined>[],
    counts: Counts,
  ) {
    return updaters.reduce(
      (f, updater) => updater(f, counts, getStatus(f)),
      fields,
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
  queryEngine: ActorInitSparql,
): Promise<ValueData[]> {
  return data[pathToSparql(path)].toArray(async (value: any) => {
    // Long term this is probably better solved with a SPARQL* annotation
    const query = deindent`
        ASK {
          GRAPH <http://schimatos/temporary-graph> {
            ${termToString(data)} ${pathToSparql(path)} ${termToString(value)}
          }
        }`;

    const result: IQueryResult = await queryEngine.query(query);
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

const runFieldsUpdates = runFieldUpdatesFactory([
  enforceQualified,
  relaxQualified,
  addFieldsFactory(true),
]);

/**
 * Convenience function that runs
 * runFieldsUpdate in the fields
 */
function runStateUpdates(state: State, counts: Counts): State {
  return {
    fields: runFieldsUpdates(state.fields, counts),
    deleted: state.deleted,
  };
}

function reducerFactory(field: AtomFieldEntry) {
  // const not = field.type === 'not';
  const counts = getCounts(field);

  return function reducer(s: State, a: Action): State {
    switch (a.type) {
      case 'delete': {
        const { state, index } = toDeletion(s, a);
        return runStateUpdates({
          fields: [
            ...state.fields.slice(0, index),
            ...state.fields.slice(index + 1),
          ],
          deleted: state.deleted,
        }, counts);
      }
      case 'unlock': {
        const { state } = toDeletion(s, a);
        return runStateUpdates(state, counts);
      }
      case 'update': {
        return s;
      }
      case 'dataChange': {
        if (isDataValueChange(s, a.values)) {
          return s;
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
  field,
  data,
  Input,
  ...props
}: RenderFieldProps<AtomFieldEntry>) {
  const [{ fields }, dispatch] = useReducer(reducerFactory(field), {
    fields: [],
    deleted: [],
  });
  useAsyncEffect(async () => {
    const values = await getValues(data, field.value.path, props.queryEngine);
    dispatch({
      type: 'dataChange',
      values,
    });
  }, [data]);
  return (
    <>
      {fields.map((f, index) => (
        <Input
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
              /* TODO: REINTRODUCE CONSTRAINTS HERE */
            }
          }
        />
      ))}
    </>
  );
}
