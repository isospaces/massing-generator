import { Shape } from "..";
import { max, min } from "../../lib/math";
import { EQ_0 } from "../utils/utils";
import { Vector } from "./vector";
import * as Intersect from "../algorithms/intersection";
import * as Distance from "../algorithms/distance";
import { Point } from "./point";
import { Line } from "./line";
import { Box } from "./box";
import { Arc } from "./arc";

export class Segment {
  start = new Vector(0, 0);
  end = new Vector(0, 0);

  constructor(a: Vector, b: Vector) {
    this.start = a.clone();
    this.end = b.clone();
  }

  /** Return new cloned instance of segment */
  clone() {
    return new Segment(this.start, this.end);
  }

  /** Returns array of start and end point */
  get vertices(): [Vector, Vector] {
    return [this.start.clone(), this.end.clone()];
  }

  /** Length of a segment */
  get length() {
    return this.start.distanceTo(this.end)[0];
  }

  /** Slope of the line - angle to axe x in radians from 0 to 2PI */
  get slope() {
    let vec = new Vector(this.start, this.end);
    return vec.slope;
  }

  /** Bounding box */
  get box() {
    return new Box(
      min(this.start.x, this.end.x),
      min(this.start.y, this.end.y),
      max(this.start.x, this.end.x),
      max(this.start.y, this.end.y)
    );
  }

  /** Returns true if equals to query segment, false otherwise */
  equalTo(segment: Segment) {
    return this.start.equalTo(segment.start) && this.end.equalTo(segment.end);
  }

  /** Returns true if segment contains point */
  contains(point: Vector) {
    return EQ_0(this.distanceToPoint(point));
  }

  /** Returns array of intersection points between segment and other shape */
  intersect(shape: Shape) {
    if (shape instanceof Vector) {
      return this.contains(shape) ? [shape] : [];
    }

    if (shape instanceof Line) {
      return Intersect.segment2Line(this, shape);
    }

    if (shape instanceof Segment) {
      return Intersect.segment2Segment(this, shape);
    }

    if (shape instanceof Circle) {
      return Intersect.segment2Circle(this, shape);
    }

    if (shape instanceof Box) {
      return Intersect.intersectSegment2Box(this, shape);
    }

    if (shape instanceof Arc) {
      return Intersect.segment2Arc(this, shape);
    }

    if (shape instanceof Polygon) {
      return Intersect.intersectSegment2Polygon(this, shape);
    }
  }

  /** Calculate distance and shortest segment from segment to shape and return as array [distance, shortest segment] */
  distanceTo(shape: Shape) {
    if (shape instanceof Point) {
      let [dist, shortest_segment] = Distance.point2segment(shape, this);
      shortest_segment = shortest_segment.reverse();
      return [dist, shortest_segment];
    }

    if (shape instanceof Circle) {
      let [dist, shortest_segment] = Distance.segmentToCircle(this, shape);
      return [dist, shortest_segment];
    }

    if (shape instanceof Line) {
      let [dist, shortest_segment] = Distance.segment2line(this, shape);
      return [dist, shortest_segment];
    }

    if (shape instanceof Segment) {
      let [dist, shortest_segment] = Distance.segment2segment(this, shape);
      return [dist, shortest_segment];
    }

    if (shape instanceof Arc) {
      let [dist, shortest_segment] = Distance.segment2arc(this, shape);
      return [dist, shortest_segment];
    }

    if (shape instanceof Polygon) {
      let [dist, shortest_segment] = Distance.shape2polygon(this, shape);
      return [dist, shortest_segment];
    }

    // if (shape instanceof PlanarSet) return Distance.shapeToPlanarSet(this, shape);
  }

  /**
   * Returns unit vector in the direction from start to end
   * @returns {Vector}
   */
  tangentInStart() {
    let vec = new Vector(this.start, this.end);
    return vec.normalize();
  }

  /**
   * Return unit vector in the direction from end to start
   * @returns {Vector}
   */
  tangentInEnd() {
    let vec = new Vector(this.end, this.start);
    return vec.normalize();
  }

  /**
   * Returns new segment with swapped start and end points
   * @returns {Segment}
   */
  reverse() {
    return new Segment(this.end, this.start);
  }

  /**
   * When point belongs to segment, return array of two segments split by given point,
   * if point is inside segment. Returns clone of this segment if query point is incident
   * to start or end point of the segment. Returns empty array if point does not belong to segment
   * @param {Point} pt Query point
   * @returns {Segment[]}
   */
  split(pt) {
    if (this.start.equalTo(pt)) return [null, this.clone()];

    if (this.end.equalTo(pt)) return [this.clone(), null];

    return [new Segment(this.start, pt), new Segment(pt, this.end)];
  }

  /**
   * Return middle point of the segment
   * @returns {Point}
   */
  middle() {
    return new Point((this.start.x + this.end.x) / 2, (this.start.y + this.end.y) / 2);
  }

  /**
   * Get point at given length
   * @param {number} length - The length along the segment
   * @returns {Point}
   */
  pointAtLength(length) {
    if (length > this.length || length < 0) return null;
    if (length == 0) return this.start;
    if (length == this.length) return this.end;
    let factor = length / this.length;
    return new Point(
      (this.end.x - this.start.x) * factor + this.start.x,
      (this.end.y - this.start.y) * factor + this.start.y
    );
  }

  distanceToPoint(pt) {
    let [dist, ...rest] = Distance.point2segment(pt, this);
    return dist;
  }

  definiteIntegral(ymin = 0.0) {
    let dx = this.end.x - this.start.x;
    let dy1 = this.start.y - ymin;
    let dy2 = this.end.y - ymin;
    return (dx * (dy1 + dy2)) / 2;
  }

  /**
   * Returns new segment translated by vector vec
   * @param {Vector} vec
   * @returns {Segment}
   */
  translate(...args) {
    return new Segment(this.start.translate(...args), this.end.translate(...args));
  }

  /**
   * Return new segment rotated by given angle around given point
   * If point omitted, rotate around origin (0,0)
   * Positive value of angle defines rotation counter clockwise, negative - clockwise
   * @param {number} angle - rotation angle in radians
   * @param {Point} center - center point, default is (0,0)
   * @returns {Segment}
   */
  rotate(angle = 0, center = new Point()) {
    let m = new Matrix();
    m = m.translate(center.x, center.y).rotate(angle).translate(-center.x, -center.y);
    return this.transform(m);
  }

  /**
   * Return new segment transformed using affine transformation matrix
   * @param {Matrix} matrix - affine transformation matrix
   * @returns {Segment} - transformed segment
   */
  transform(matrix = new Matrix()) {
    return new Segment(this.start.transform(matrix), this.end.transform(matrix));
  }

  /**
   * Returns true if segment start is equal to segment end up to DP_TOL
   * @returns {boolean}
   */
  isZeroLength() {
    return this.start.equalTo(this.end);
  }

  /**
   * Sort given array of points from segment start to end, assuming all points lay on the segment
   * @param {Point[]} - array of points
   * @returns {Point[]} new array sorted
   */
  sortPoints(pts) {
    let line = new Line(this.start, this.end);
    return line.sortPoints(pts);
  }

  /**
   * This method returns an object that defines how data will be
   * serialized when called JSON.stringify() method
   * @returns {Object}
   */
  toJSON() {
    return Object.assign({}, this, { name: "segment" });
  }

  /**
   * Return string to draw segment in svg
   * @param {Object} attrs - an object with attributes for svg path element,
   * like "stroke", "strokeWidth" <br/>
   * Defaults are stroke:"black", strokeWidth:"1"
   * @returns {string}
   */
  svg(attrs = {}) {
    let { stroke, strokeWidth, id, className } = attrs;
    // let rest_str = Object.keys(rest).reduce( (acc, key) => acc += ` ${key}="${rest[key]}"`, "");
    let id_str = id && id.length > 0 ? `id="${id}"` : "";
    let class_str = className && className.length > 0 ? `class="${className}"` : "";

    return `\n<line x1="${this.start.x}" y1="${this.start.y}" x2="${this.end.x}" y2="${this.end.y}" stroke="${
      stroke || "black"
    }" stroke-width="${strokeWidth || 1}" ${id_str} ${class_str} />`;
  }
}

Segment = Segment;
/**
 * Shortcut method to create new segment
 */
export const segment = (...args) => new Segment(...args);
segment = segment;
