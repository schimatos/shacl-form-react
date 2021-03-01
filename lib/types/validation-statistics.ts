/**
 * Stores the (qualified)?(min|max)Count
 * and the differences
 */
export interface Counts {
  count: {
    min: number;
    max: number;
  }
  qualified: {
    min: number;
    max: number;
  }
  unQualified: {
    min: number;
    max: number;
  }
}

/**
 * Provides the status of the number
 * of valid entries (qualified or no)
 * to a particular property
 */
export interface Status {
  qualified: {
    total: number;
    valid: number;
  }
  standard: {
    total: number;
    valid: number;
  }
  unQualified: {
    total: number;
    valid: number;
  }
  valid: boolean;
}
