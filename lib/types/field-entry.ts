import type { Quad } from 'rdf-js';
import type { AnyResource } from 'rdf-object-proxy';
import type { ActorInitSparql } from '@comunica/actor-init-sparql';
import type { Input } from './input';
import type * as sh from './shacl';

export interface GroupEntry {
  type: 'group';
  value: sh.NodeGroup;
  fields: FieldEntries[];
  // To access all data required for drag/drop
  parent: sh.NodeShape;
}

export interface FieldEntry<
  T extends 'and' | 'or' | 'xone' | 'not' | 'property',
  K extends AnyResource
> {
  type: T;
  value: K;
  // To access all data required for drag/drop
  parent: sh.NodeShape;
}

export type CollectionFieldEntry =
  | FieldEntry<'and', sh.and>
  | FieldEntry<'or', sh.or>
  | FieldEntry<'xone', sh.xone>;

export type AtomFieldEntry =
  | FieldEntry<'not', sh.not>
  | FieldEntry<'property', sh.PropertyShape>;

export type FieldEntries = CollectionFieldEntry | AtomFieldEntry;

export type FieldType = GroupEntry | FieldEntries;

export type FormChangeEvent = (e: {
  type: 'delete' | 'insert';
  field: FieldType;
  data: string;
}) => void;

export type OnChange = (value: {
  property: string;
  valid: boolean;
  path: FieldType[];
  insert: Quad[];
  delete: Quad[];
}) => void

interface validationResult {
  valid: boolean;
  message?: string;
}

/**
 * Props that are passed through *all*
 * form components
 */
export interface PassedProps {
  path: FieldType[];
  hidden: boolean;
  draggable: boolean;
  data: any;
  onFormChange: FormChangeEvent;
  onChange: OnChange;
  validities: Record<string, boolean>;
  queryEngine: ActorInitSparql;
  pathFactory: any;
  selectPanel?: boolean;
  panelDescription?: boolean;
  Input: Input;
  validationEngine<T extends boolean>(shape: sh.PropertyShape, data: string, async: T):
    T extends true ? Promise<validationResult> : validationResult
}

export interface RenderFieldsProps extends PassedProps {
  fields: FieldType[];
}

export interface RenderFieldProps<T extends FieldType = FieldType> extends PassedProps {
  field: T;
}
