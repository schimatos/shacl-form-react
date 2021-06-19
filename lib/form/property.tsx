import React, { useReducer } from 'react';
import type {
  NamedNode, BlankNode, Literal, Quad,
} from 'rdf-js';
import { copy } from 'copy-anything';
// import type { AnyResource } from 'rdf-object-proxy';
import type { Resource } from 'rdf-object';
// import { termToString } from 'rdf-string-ttl';
// import deindent from 'deindent';
// import type {
//   ActorInitSparql,
//   IQueryResult,
// } from '@comunica/actor-init-sparql';
// import { useAsyncEffect } from '@jeswr/use-async-effect';
// import { namedNode } from '@rdfjs/data-model';
import { quad } from '@rdfjs/data-model';
import { ToLabel } from 'sparql-search-bar';
import sh from '@ontologies/shacl';
import rdf from '@ontologies/rdf';
import rdfs from '@ontologies/rdfs';
import { v4 as uuidv4 } from 'uuid'; // TODO [FUTURE]: REMOVE ONCE KEY ERRORS RESOLVED
import type {
  RenderFieldProps,
  AtomFieldEntry,
  PropertyEntry,
  Counts,
  Status,
  PassedProps,
  sh as shacl,
} from '../types';
import type { Data } from '../types/input';
import { getCounts } from '../utils/property/get-counts';
import { getStatus } from '../utils/property/get-status';
import {
  getFields,
  // getFields,
  getLabel, getSafePropertyEntries, // pathToSparql,
} from '../utils';
import { Fieldset } from './fieldset';
// import { Fields } from './fields';
import { PathSelector } from './path';
import { Fields } from './fields';

interface State {
  fields: PropertyEntry<NamedNode | BlankNode | Literal | undefined>[];
  deleted: PropertyEntry[];
  counts: Counts;
  // TODO: Double check if the key is necessary
  key: number;
  /**
   * Subject and predicate are the subject and predicate to
   * be used with the term
   */
  // TODO: Use better types here
  subject: any;
  predicate: any;
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
  } // CHECK WHY THERE ARE TWO UPDATE TYPES
  | {
    type: 'update';
    index: number;
    data: Data<BlankNode | Literal | NamedNode | undefined>;
    /**
     * onChange function to be triggered during the update
     */
    onChange: PassedProps['onChange']
    path: PassedProps['path']
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
    /**
     * onChange function to be triggered during the update
     */
    onChange: PassedProps['onChange']
    path: PassedProps['path']
  }
  | {
    type: 'dataChange';
    values: ValueData[];
    /**
     * Subject and predicate are the subject and predicate to
     * be used with the term
     */
    // TODO: Use better types here
    subject: any;
    predicate: any;
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
  annotations: Quad[] = [],
): PropertyEntry<undefined | NamedNode | BlankNode | Literal> {
  return {
    valid: false,
    qualifiedValid: false,
    qualifiedEnforced: false,
    preloaded,
    data: {
      term,
      annotations,
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
  annotations: []
}

/**
 * The data 'provider' may itself be a promise and hence we have to resolve it
 * first
 * TODO: Make the types around this stricter
 */
// async function getValues(
//   data: any,
//   path: AnyResource,
//   queryEngine?: ActorInitSparql,
// ): Promise<ValueData[]> {
//   if (!data) {
//     return [];
//   }
//   return data[pathToSparql(path)].toArray(async (value: any) => {
//     // Long term this is probably better solved with a SPARQL* annotation
//     const query = deindent`
//         ASK {
//           GRAPH <http://schimatos/temporary-graph> {
//             ${termToString(data)} ${pathToSparql(path)} ${termToString(value)}
//           }
//         }`;

//     const result: IQueryResult = await queryEngine?.query(query) ?? {
//       type: 'boolean',
//       booleanResult: Promise.resolve(false),
//     };

//     if (result.type !== 'boolean') {
//       throw new Error('Boolean result expected');
//     }

//     return {
//       value,
//       temporary: result.booleanResult,
//     };
//   });
// }

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

export function init({
  values, field, subject, predicate,
}: {
  values: ValueData[],
  field: AtomFieldEntry,
  subject: any,
  predicate: any
}) {
  const counts = getCounts(field);
  return runStateUpdates({
    fields: values.map(
      (value, i) => createLoaded(i, value.value, !value.temporary, value.annotations),
    ),
    deleted: [],
    counts,
    key: values.length,
    subject,
    predicate,
  });
}

function reducerFactory(field: AtomFieldEntry) {
  return function reducer(s: State, a: Action): State {
    // console.log('reducer called', s, a);
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
        // TODO [FUTURE]: See if we need to propogate up here
        const fields = [...s.fields];
        fields[a.index] = {
          ...fields[a.index],
          data: a.data,
        };
        const { valid } = getStatus(fields);
        const deleted = s.deleted
          .map((x) => {
            if (x.data.term) {
              // TODO: Handle this case - it should never occur
              return [
                // TODO inverse path handling here
                quad(s.subject, s.predicate, x.data.term),
                ...x.data.annotations,
              ];
            }
            return [];
          })
          .flat();

        const additions = fields
          .map((x) => {
            if (x.data.term && !x.preloaded) {
              return [
                quad(
                  s.subject, // This it not necessarily a named node
                  s.predicate,
                  x.data.term,
                ),
                ...x.data.annotations,
              ];
            }
            return [];
          })
          .flat();
        a.onChange({
          valid,
          delete: deleted,
          insert: additions,
          // TODO: Double check this
          property: s.predicate,
          path: a.path,
        });
        return {
          ...s,
          fields,
        };
      }
      case 'dataChange': {
        if (
          isDataValueChange(s, a.values)
          || (s.subject !== a.subject)
          || (s.predicate !== a.predicate)
        ) {
          return init({
            values: a.values, field, subject: a.subject, predicate: a.predicate,
          });
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
  // data,
  // Input,
  ...props
}: RenderFieldProps<AtomFieldEntry>) {
  const label = getLabel(props.field);
  const [state, dispatch] = useReducer(
    reducerFactory(props.field),
    {
      values: [],
      field: props.field,
      // Only set subject and predicate immediately if the path is not variable
      subject: props.field.value.path.type === 'NamedNode' ? props.data : undefined,
      predicate: props.field.value.path.type === 'NamedNode' ? props.field.value.path : undefined,
    },
    init,
  );
  // useAsyncEffect(async () => {
  //   const values = await getValues(props.data, props.field.value.path, props.queryEngine);
  //   dispatch({
  //     type: 'dataChange',
  //     values,
  //   });
  // }, [props.data]);
  const { fields } = state;
  // console.log(props.field.value.path.term.value)
  // TODO [FUTURE]: Propogate props.field.value.path.term.value into props.path earlier
  const key = `${props.path.map((x) => x.value).join('&')}&${props.field.value.path.term.value}`;
  console.log(key);
  return (
    <>
      {props.field.value.path.type === 'BlankNode' && <PathSelector
        key={`path-selector-${key}-${uuidv4()}`}
        data={props.data}
        path={props.field.value.path}
        onChange={async ({ data: d }) => {
          // TODO [FUTURE]: Remove implicit type & handle temporary variables properly
          if (d) {
            dispatch({
              type: 'dataChange',
              subject: await d.subject,
              predicate: await d.predicate,
              values: await d.toArray(async (value: any) => {
                const type = await value[rdf.type.value];
                const label = await value[rdfs.label.value];

                const annotations = [];

                if (`${type}` !== 'undefined') {
                  annotations.push(quad(value, rdf.type, type));
                }

                if (`${label}` !== 'undefined') {
                  annotations.push(quad(value, rdfs.label, label));
                }

                return {
                  value: await value,
                  temporary: false,
                  annotations,
                };
              }),
            });
          }
        }} />}
      <Fieldset key={`fieldset-${key}-${uuidv4()}`} {...props}>
        {fields.map((f, index) => <>{(f.preloaded ? (
          <>
            {
              f.data.term?.termType === 'BlankNode' || f.data.term?.termType === 'NamedNode'
                ? <ToLabel
                  pathFactory={props.pathFactory}
                  key={`fieldset-${key}-${f.key}${index}`}
                  data={{
                    value: f.data.term?.value,
                    termType: f.data.term?.termType,
                    'http://www.w3.org/2000/01/rdf-schema#label': undefined,
                  }} />
                : `${f.data.term}`
            }
            <button
              name="edit"
              key={uuidv4()}
              hidden={//! props.disabled ||
                props.hidden}
              onClick={() => {
                dispatch({
                  type: 'unlock',
                  index,
                });
              }}
              type="button"
            >
              {'\u270E'}
            </button>
            <button
              name="delete"
              key={uuidv4()}

              hidden={//! disabled ||
                props.hidden}
              onClick={() => {
                dispatch({
                  type: 'delete',
                  index,
                });
              }}
              type="button"
            >
              x
            </button>
          </>
        ) : (
          <>
            <props.Input
              // TODO: REMOVE index here
              key={`fieldset-${key}-${f.key}${index}`}
              props={f.data}
              onChange={(data) => {
                dispatch({
                  type: 'update',
                  index,
                  data,
                  onChange: props.onChange,
                  path: props.path,
                });
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
          </>
        ))}
          <Fields
            {...props}
            key={uuidv4()}
            path={[...props.path, props.field]}
            data={f.data}
            fields={getFields(props.field.value as shacl.NodeShape)}
          />
        </>)}

      </Fieldset>

    </>
  );
}

// TODO [FUTURE]: Preprocess this fully (flags should be combined with pattern etc.)
function getRestrictions(property: Record<string, Resource>) {
  const restrictions: Record<string, any> = {
    // termType: {
    //   // in: ['BlankNode', 'NamedNode', 'Literal']
    //   in: {
    //     BlankNode: true,
    //     NamedNode: true,
    //     Literal: true
    //   }
    // }
  };
  /* eslint-disable guard-for-in */
  for (const p in property) {
    if (property[p].term.termType === 'Literal') {
      restrictions[/[a-z]+$/i.exec(p)?.[0] ?? ''] = property[p].term.value;
    }
    if (p === sh.nodeKind.value) {
      restrictions.termType = {
        // TODO: Use proper nodekind mapping here
        in: [/[a-z]+$/i.exec(property[p].term.value)?.[0]],
      };
    }
    if (p === sh.datatype.value) {
      restrictions.datatype = {
        in: [/[a-z]+$/i.exec(property[p].term.value)?.[0]],
      };
    }
    if (p === sh.class.value) {
      restrictions[rdf.type.value] = {
        in: {
          BlankNode: ['BlankNode'],
          IRI: ['NamedNode'],
          Literal: ['Literal'],
          BlankNodeOrIRI: ['BlankNode', 'IRI'],
          BlankNodeOrLiteral: ['BlankNode', 'Literal'],
          // LiteralOrIRI: ['Literal', 'IRI'],
          IRIOrLiteral: ['Literal', 'IRI'],
        }[/[a-z]+$/i.exec(property[p].term.value)?.[0] ?? ''],
      };
    }
  }
  return restrictions;
}
