import type * as sh from './shacl';

/**
 * Convenience type to describe any logical collection in the
 * SHACL standard
 */
export type LogicalCollection = sh.and | sh.or | sh.xone;
