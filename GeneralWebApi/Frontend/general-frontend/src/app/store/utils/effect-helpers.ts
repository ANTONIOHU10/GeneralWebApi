/**
 * Effect Helper Utilities
 * 
 * Provides reusable RxJS operators and patterns for NgRx Effects
 * to prevent duplicate requests and handle common scenarios.
 */

/**
 * Create a parameter comparison function for Effects
 * 
 * Useful when you want to compare specific parameters from action and store state
 * 
 * @param extractParams - Function to extract parameters to compare
 * @returns Comparison function for distinctUntilChanged
 * 
 * @example
 * ```typescript
 * distinctUntilChanged(
 *   createParamComparator(([action, filters, pagination]) => ({
 *     page: action.page ?? pagination.currentPage,
 *     searchTerm: action.searchTerm ?? filters.searchTerm,
 *   }))
 * )
 * ```
 */
export function createParamComparator<T extends unknown[]>(
  extractParams: (value: T) => Record<string, unknown>
): (prev: T, curr: T) => boolean {
  return (prev: T, curr: T) => {
    const prevParams = extractParams(prev);
    const currParams = extractParams(curr);
    return JSON.stringify(prevParams) === JSON.stringify(currParams);
  };
}

