import { ray_shoot } from "../algorithms/ray_shooting";
import { Inclusion, Overlap } from "../utils/constants";
import { EQ } from "../utils/utils";
import { Line } from "./line";
import { Segment } from "./segment";
import { Vector } from "./vector";

/**
 * Class representing an edge of polygon. Edge shape may be Segment or Arc.
 * Each edge contains references to the next and previous edges in the face of the polygon.
 */
export class Edge {
  shape: Segment | Arc;
  /** Pointer to the next edge in the face */
  next?: Edge;
  /** Pointer to the previous edge in the face */
  prev?: Edge;
  /** Pointer to the face containing this edge */
  face?: Face;
  /** "Arc distance" from the face start */
  arcLength = 0;
  overlap?: Overlap;
  inclusion?: Inclusion;
  startInclusion?: Inclusion;
  endInclusion?: Inclusion;

  constructor(shape: Segment | Arc) {
    this.shape = shape;
  }

  get start() {
    return this.shape.start;
  }

  get end() {
    return this.shape.end;
  }

  get length() {
    return this.shape.length;
  }

  get box() {
    return this.shape.box;
  }

  isSegment() {
    return this.shape instanceof Segment;
  }

  isArc() {
    return this.shape instanceof Arc;
  }

  middle() {
    return this.shape.middle();
  }

  /**
   * Get point at given length
   * @param {number} length - The length along the edge
   * @returns {Point}
   */
  pointAtLength(length: number) {
    return this.shape.pointAtLength(length);
  }

  /** Returns true if point belongs to the edge, false otherwise */
  contains(point: Vector) {
    return this.shape.contains(point);
  }

  /**
   * Set inclusion flag of the edge with respect to another polygon
   * Inclusion flag is one of Inclusion.Inside, Inclusion.Outside, Flatten.BOUNDARY
   * @param polygon
   */
  setInclusion(polygon: Polygon) {
    if (this.inclusion !== undefined) return this.inclusion;

    if (this.shape instanceof Line || this.shape instanceof Ray) {
      this.inclusion = Inclusion.Outside;
      return this.inclusion;
    }

    if (this.startInclusion === undefined) {
      this.startInclusion = ray_shoot(polygon, this.start);
    }
    if (this.endInclusion === undefined) {
      this.endInclusion = ray_shoot(polygon, this.end);
    }
    /* At least one end outside - the whole edge outside */
    if (this.startInclusion === Inclusion.Outside || this.endInclusion == Inclusion.Outside) {
      this.inclusion = Inclusion.Outside;
    } else if (this.startInclusion === Inclusion.Inside || this.endInclusion == Inclusion.Inside) {
      /* At least one end inside - the whole edge inside */
      this.inclusion = Inclusion.Inside;
    } else {
      /* Both are boundary - check the middle point */
      let bvMiddle = ray_shoot(polygon, this.middle());
      // let boundary = this.middle().distanceTo(polygon)[0] < 10*Flatten.DP_TOL;
      // let bvMiddle = boundary ? Flatten.BOUNDARY : ray_shoot(polygon, this.middle());
      this.inclusion = bvMiddle;
    }
    return this.inclusion;
  }

  /**
   * Set overlapping between two coincident boundary edges
   * Overlapping flag is one of Flatten.OVERLAP_SAME or Flatten.OVERLAP_OPPOSITE
   * @param edge
   */
  setOverlap(edge: Edge) {
    let flag = undefined;
    let shape1 = this.shape;
    let shape2 = edge.shape;

    if (shape1 instanceof Segment && shape2 instanceof Segment) {
      if (shape1.start.equalTo(shape2.start) && shape1.end.equalTo(shape2.end)) {
        flag = Overlap.Same;
      } else if (shape1.start.equalTo(shape2.end) && shape1.end.equalTo(shape2.start)) {
        flag = Overlap.Opposite;
      }
    } else if (shape1 instanceof Arc && shape2 instanceof Arc) {
      if (
        shape1.start.equalTo(shape2.start) &&
        shape1.end.equalTo(shape2.end) /*shape1.counterClockwise === shape2.counterClockwise &&*/ &&
        shape1.middle().equalTo(shape2.middle())
      ) {
        flag = Overlap.Same;
      } else if (
        shape1.start.equalTo(shape2.end) &&
        shape1.end.equalTo(shape2.start) /*shape1.counterClockwise !== shape2.counterClockwise &&*/ &&
        shape1.middle().equalTo(shape2.middle())
      ) {
        flag = Overlap.Opposite;
      }
    } else if (
      (shape1 instanceof Segment && shape2 instanceof Arc) ||
      (shape1 instanceof Arc && shape2 instanceof Segment)
    ) {
      if (
        shape1.start.equalTo(shape2.start) &&
        shape1.end.equalTo(shape2.end) &&
        shape1.middle().equalTo(shape2.middle())
      ) {
        flag = Overlap.Same;
      } else if (
        shape1.start.equalTo(shape2.end) &&
        shape1.end.equalTo(shape2.start) &&
        shape1.middle().equalTo(shape2.middle())
      ) {
        flag = Overlap.Opposite;
      }
    }

    /* Do not update overlap flag if already set on previous chain */
    if (this.overlap === undefined) this.overlap = flag;
    if (edge.overlap === undefined) edge.overlap = flag;
  }

  svg() {
    if (this.shape instanceof Segment) {
      return ` L${this.shape.end.x},${this.shape.end.y}`;
    } else if (this.shape instanceof Arc) {
      let arc = this.shape;
      let largeArcFlag;
      let sweepFlag = arc.counterClockwise ? "1" : "0";

      // Draw full circe arc as special case: split it into two half-circles
      if (EQ(arc.sweep, 2 * Math.PI)) {
        let sign = arc.counterClockwise ? 1 : -1;
        let halfArc1 = new Arc(arc.pc, arc.r, arc.startAngle, arc.startAngle + sign * Math.PI, arc.counterClockwise);
        let halfArc2 = new Arc(arc.pc, arc.r, arc.startAngle + sign * Math.PI, arc.endAngle, arc.counterClockwise);

        largeArcFlag = "0";

        return ` A${halfArc1.r},${halfArc1.r} 0 ${largeArcFlag},${sweepFlag} ${halfArc1.end.x},${halfArc1.end.y}
                    A${halfArc2.r},${halfArc2.r} 0 ${largeArcFlag},${sweepFlag} ${halfArc2.end.x},${halfArc2.end.y}`;
      } else {
        largeArcFlag = arc.sweep <= Math.PI ? "0" : "1";
        return ` A${arc.r},${arc.r} 0 ${largeArcFlag},${sweepFlag} ${arc.end.x},${arc.end.y}`;
      }
    }
  }

  toJSON() {
    return this.shape.toJSON();
  }
}
