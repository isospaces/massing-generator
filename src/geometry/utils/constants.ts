/** Global constant CCW defines counter clockwise direction of arc */
export const CCW = true;

/** Global constant CW defines clockwise direction of arc */
export const CW = false;

/**
 * Defines orientation for face of the polygon: clockwise, counter clockwise
 * or not orientable in the case of self-intersection
 * @type {{CW: number, CCW: number, NOT_ORIENTABLE: number}}
 */
export const ORIENTATION = { CCW: -1, CW: 1, NOT_ORIENTABLE: 0 };

export const PIx2 = 2 * Math.PI;

export enum Inclusion {
  OUTSIDE,
  INSIDE,
  BOUNDARY,
  CONTAINS,
  INTERLACE,
}

export enum Overlap {
  OVERLAP_SAME = 1,
  OVERLAP_OPPOSITE = 2,
}

export enum VertexType {
  NOT_VERTEX = 0,
  START_VERTEX = 1,
  END_VERTEX = 2,
}
