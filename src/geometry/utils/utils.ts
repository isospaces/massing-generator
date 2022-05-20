/**
 * Floating point comparison tolerance.
 * Default value is 0.000001 (10e-6)
 */
let DP_TOL = 0.000001;

/** Set new floating point comparison tolerance */
export const setTolerance = (tolerance: number) => {
  DP_TOL = tolerance;
};

/** Get floating point comparison tolerance */
export const getTolerance = () => DP_TOL;

/** Decimal precision */
export const DECIMALS = 3;

/** Returns *true* if value comparable to zero */
export const EQ_0 = (x: number) => x < DP_TOL && x > -DP_TOL;

/** Returns *true* if two values are equal up to DP_TOL */
export const EQ = (x: number, y: number) => x - y < DP_TOL && x - y > -DP_TOL;

/** Returns *true* if first argument greater than second argument up to DP_TOL */
export const GT = (x: number, y: number) => x - y > DP_TOL;

/** Returns *true* if first argument greater than or equal to second argument up to DP_TOL */
export const GE = (x: number, y: number) => x - y > -DP_TOL;

/** Returns *true* if first argument less than second argument up to DP_TOL */
export const LT = (x: number, y: number) => x - y < -DP_TOL;

/** Returns *true* if first argument less than or equal to second argument up to DP_TOL */
export const LE = (x: number, y: number) => x - y < DP_TOL;
