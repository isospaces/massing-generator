/** Class of system errors */
export default class Errors {
  /** Throw error ILLEGAL_PARAMETERS when cannot instantiate from given parameter */
  static get ILLEGAL_PARAMETERS() {
    return new ReferenceError("Illegal Parameters");
  }

  /** Throw error ZERO_DIVISION to catch situation of zero division */
  static get ZERO_DIVISION() {
    return new Error("Zero division");
  }

  /** Error to throw from BooleanOperations module in case when fixBoundaryConflicts not capable to fix it */
  static get UNRESOLVED_BOUNDARY_CONFLICT() {
    return new Error("Unresolved boundary conflict in boolean operation");
  }

  /**
   * Error to throw from LinkedList:testInfiniteLoop static method
   * in case when circular loop detected in linked list
   */
  static get INFINITE_LOOP() {
    return new Error("Infinite loop");
  }
}
