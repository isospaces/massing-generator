import { Shape } from "..";
import { abs } from "../../lib/math";
import Intersection from "../algorithms/intersection";
import { CCW, PIx2 } from "../utils/constants";
import { EQ, GT, LE, LT } from "../utils/utils";
import { Box } from "./box";
import { Line } from "./line";
import { Segment } from "./segment";
import { Vector } from "./vector";

export class Arc {
  private _center = new Vector(0, 0);
  radius = 1;
  startAngle = 0;
  endAngle = 2 * Math.PI;
  counterClockwise = CCW;

  constructor(center: Vector, radius: number, startAngle: number, endAngle: number, counterClockwise: boolean) {
    this._center = center;
    this.radius = radius;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.counterClockwise = counterClockwise;
  }

  /** Return new cloned instance of arc */
  clone() {
    return new Arc(this.center, this.radius, this.startAngle, this.endAngle, this.counterClockwise);
  }

  /** Get sweep angle in radians. Sweep angle is non-negative number from 0 to 2*PI */
  get sweep() {
    if (EQ(this.startAngle, this.endAngle)) return 0.0;
    if (EQ(abs(this.startAngle - this.endAngle), PIx2)) {
      return PIx2;
    }
    let sweep;
    if (this.counterClockwise) {
      sweep = GT(this.endAngle, this.startAngle)
        ? this.endAngle - this.startAngle
        : this.endAngle - this.startAngle + PIx2;
    } else {
      sweep = GT(this.startAngle, this.endAngle)
        ? this.startAngle - this.endAngle
        : this.startAngle - this.endAngle + PIx2;
    }

    if (GT(sweep, PIx2)) {
      sweep -= PIx2;
    }
    if (LT(sweep, 0)) {
      sweep += PIx2;
    }
    return sweep;
  }

  get start() {
    const p0 = new Vector(this._center.x + this.radius, this._center.y);
    return p0.rotate(this.startAngle, this._center);
  }

  get end() {
    const p0 = new Vector(this._center.x + this.radius, this._center.y);
    return p0.rotate(this.endAngle, this._center);
  }

  get center() {
    return this._center.clone();
  }

  get vertices() {
    return [this.start.clone(), this.end.clone()];
  }

  get length() {
    return Math.abs(this.sweep * this.radius);
  }

  get box() {
    const functionalArcs = this.breakToFunctional();
    let box = functionalArcs.reduce((acc, arc) => acc.merge(arc.start.box), new Flatten.Box());
    box = box.merge(this.end.box);
    return box;
  }

  /** Returns true if arc contains point, false otherwise */
  contains(point: Vector) {
    // first check if  point on circle (pc,r)
    if (!EQ(this._center.distanceTo(point)[0], this.radius)) return false;

    // point on circle
    if (point.equalTo(this.start)) return true;

    let angle = new Vector(this._center, point).slope;
    let test_arc = new Arc(this._center, this.radius, this.startAngle, angle, this.counterClockwise);
    return LE(test_arc.length, this.length);
  }

  /**
   * When given point belongs to arc, return array of two arcs split by this point. If points is incident
   * to start or end point of the arc, return clone of the arc. If point does not belong to the arcs, return
   * empty array.
   */
  split(point: Vector) {
    if (this.start.equalTo(point)) return [null, this.clone()];

    if (this.end.equalTo(point)) return [this.clone(), null];

    let angle = new Vector(this._center, point).slope;

    return [
      new Arc(this._center, this.radius, this.startAngle, angle, this.counterClockwise),
      new Arc(this._center, this.radius, angle, this.endAngle, this.counterClockwise),
    ];
  }

  /** Return middle point of the arc */
  middle() {
    let endAngle = this.counterClockwise ? this.startAngle + this.sweep / 2 : this.startAngle - this.sweep / 2;
    let arc = new Arc(this._center, this.radius, this.startAngle, endAngle, this.counterClockwise);
    return arc.end;
  }

  /** Get point at given length */
  pointAtLength(length: number) {
    if (length > this.length || length < 0) return null;
    if (length == 0) return this.start;
    if (length == this.length) return this.end;
    let factor = length / this.length;
    let endAngle = this.counterClockwise
      ? this.startAngle + this.sweep * factor
      : this.startAngle - this.sweep * factor;
    let arc = new Arc(this._center, this.radius, this.startAngle, endAngle, this.counterClockwise);
    return arc.end;
  }

  /** Returns chord height ("sagitta") of the arc */
  chordHeight() {
    return (1.0 - Math.cos(Math.abs(this.sweep / 2.0))) * this.radius;
  }

  /** Returns array of intersection points between arc and other shape */
  intersect(shape: Shape) {
    if (shape instanceof Vector) return this.contains(shape) ? [shape] : [];
    if (shape instanceof Line) return Intersection.line2Arc(shape, this);
    if (shape instanceof Circle) return Intersection.arc2Circle(this, shape);
    if (shape instanceof Segment) return Intersection.segment2Arc(shape, this);
    if (shape instanceof Box) return Intersection.arc2Box(this, shape);
    if (shape instanceof Arc) return Intersection.arc2Arc(this, shape);
    if (shape instanceof Polygon) return Intersection.arc2Polygon(this, shape);
  }

  /** Calculate distance and shortest segment from arc to shape and return array [distance, shortest segment] */
  distanceTo(shape: Shape) {
    if (shape instanceof Vector) {
      let [dist, shortest_segment] = Distance.point2arc(shape, this);
      shortest_segment = shortest_segment.reverse();
      return [dist, shortest_segment];
    }

    if (shape instanceof Segment) {
      let [dist, shortest_segment] = Distance.segment2arc(shape, this);
      return [dist, shortest_segment.reverse()];
    }

    if (shape instanceof Circle) return Distance.arc2circle(this, shape);
    if (shape instanceof Line) return Distance.arc2line(this, shape);
    if (shape instanceof Arc) return Distance.arc2arc(this, shape);
    if (shape instanceof Polygon) return Distance.shape2polygon(this, shape);
    if (shape instanceof PlanarSet) return Distance.shape2planarSet(this, shape);
  }

  /** Breaks arc in extreme point 0, pi/2, pi, 3*pi/2 and returns array of sub-arcs */
  breakToFunctional() {
    const functionalArcs: Arc[] = [];
    const angles = [0, Math.PI / 2, (2 * Math.PI) / 2, (3 * Math.PI) / 2];

    const r = this.radius;
    const { x, y } = this._center;
    const points = [new Vector(x + r, y), new Vector(x, y + r), new Vector(x - r, y), new Vector(x, y - r)];

    // If arc contains extreme point,
    // create test arc started at start point and ended at this extreme point
    let testArcs = [];
    for (let i = 0; i < 4; i++) {
      if (points[i].on(this)) {
        testArcs.push(new Arc(this.center, this.radius, this.startAngle, angles[i], this.counterClockwise));
      }
    }

    if (testArcs.length == 0) {
      // arc does contain any extreme point
      functionalArcs.push(this.clone());
    } else {
      // arc passes extreme point
      // sort these arcs by length
      testArcs.sort((arc1, arc2) => arc1.length - arc2.length);

      for (let i = 0; i < testArcs.length; i++) {
        let prev_arc = functionalArcs.length > 0 ? functionalArcs[functionalArcs.length - 1] : undefined;
        let new_arc;
        if (prev_arc) {
          new_arc = new Arc(this._center, this.radius, prev_arc.endAngle, testArcs[i].endAngle, this.counterClockwise);
        } else {
          new_arc = new Arc(this._center, this.radius, this.startAngle, testArcs[i].endAngle, this.counterClockwise);
        }
        if (!Flatten.Utils.EQ_0(new_arc.length)) {
          functionalArcs.push(new_arc.clone());
        }
      }

      // add last sub arc
      let prev_arc = functionalArcs.length > 0 ? functionalArcs[functionalArcs.length - 1] : undefined;
      let new_arc;
      if (prev_arc) {
        new_arc = new Flatten.Arc(this._center, this.radius, prev_arc.endAngle, this.endAngle, this.counterClockwise);
      } else {
        new_arc = new Flatten.Arc(this._center, this.radius, this.startAngle, this.endAngle, this.counterClockwise);
      }
      // It could be 2*PI when occasionally start = 0 and end = 2*PI but this is not valid for breakToFunctional
      if (!Flatten.Utils.EQ_0(new_arc.length) && !Flatten.Utils.EQ(new_arc.sweep, 2 * Math.PI)) {
        functionalArcs.push(new_arc.clone());
      }
    }
    return functionalArcs;
  }

  /**
   * Return tangent unit vector in the start point in the direction from start to end
   * @returns {Vector}
   */
  tangentInStart() {
    let vec = new Flatten.Vector(this._center, this.start);
    let angle = this.counterClockwise ? Math.PI / 2 : -Math.PI / 2;
    let tangent = vec.rotate(angle).normalize();
    return tangent;
  }

  /**
   * Return tangent unit vector in the end point in the direction from end to start
   * @returns {Vector}
   */
  tangentInEnd() {
    let vec = new Flatten.Vector(this._center, this.end);
    let angle = this.counterClockwise ? -Math.PI / 2 : Math.PI / 2;
    let tangent = vec.rotate(angle).normalize();
    return tangent;
  }

  /**
   * Returns new arc with swapped start and end angles and reversed direction
   * @returns {Arc}
   */
  reverse() {
    return new Flatten.Arc(this._center, this.radius, this.endAngle, this.startAngle, !this.counterClockwise);
  }

  /**
   * Returns new arc translated by vector vec
   * @param {Vector} vec
   * @returns {Segment}
   */
  translate(...args) {
    let arc = this.clone();
    arc.pc = this._center.translate(...args);
    return arc;
  }

  /**
   * Return new segment rotated by given angle around given point
   * If point omitted, rotate around origin (0,0)
   * Positive value of angle defines rotation counter clockwise, negative - clockwise
   * @param {number} angle - rotation angle in radians
   * @param {Point} center - center point, default is (0,0)
   * @returns {Arc}
   */
  rotate(angle = 0, center = new Flatten.Point()) {
    let m = new Flatten.Matrix();
    m = m.translate(center.x, center.y).rotate(angle).translate(-center.x, -center.y);
    return this.transform(m);
  }

  /**
   * Return new arc scaled by scaleX, scaleY.
   * @param {number} scaleX - scale value by X
   * @param {number} scaleY - scale value by Y
   * @returns {Arc}
   */
  scale(scaleX = 1, scaleY = 1) {
    let m = new Flatten.Matrix();
    m = m.scale(scaleX, scaleY);
    return this.transform(m);
  }

  /**
   * Return new arc transformed using affine transformation matrix <br/>
   * Note 1. Non-equal scaling by x and y (abs(matrix[0]) != abs(matrix[3])) produce illegal result because
   * it should create elliptic arc but this package does not support ellipses
   * Note 2. Mirror transformation (matrix[0] * matrix[3] < 0) change direction of the arc to the opposite
   * TODO: support non-equal scaling arc to ellipse or throw exception ?
   * @param {Matrix} matrix - affine transformation matrix
   * @returns {Arc}
   */
  transform(matrix = new Flatten.Matrix()) {
    let newStart = this.start.transform(matrix);
    let newEnd = this.end.transform(matrix);
    let newCenter = this._center.transform(matrix);
    let newDirection = this.counterClockwise;
    if (matrix.a * matrix.d < 0) {
      newDirection = !newDirection;
    }
    let arc = Flatten.Arc.arcSE(newCenter, newStart, newEnd, newDirection);
    return arc;
  }

  static arcSE(center, start, end, counterClockwise) {
    let { vector } = Flatten;
    let startAngle = vector(center, start).slope;
    let endAngle = vector(center, end).slope;
    if (Flatten.Utils.EQ(startAngle, endAngle)) {
      endAngle += 2 * Math.PI;
      counterClockwise = true;
    }
    let r = vector(center, start).length;

    return new Flatten.Arc(center, r, startAngle, endAngle, counterClockwise);
  }

  definiteIntegral(ymin = 0) {
    let f_arcs = this.breakToFunctional();
    let area = f_arcs.reduce((acc, arc) => acc + arc.circularSegmentDefiniteIntegral(ymin), 0.0);
    return area;
  }

  circularSegmentDefiniteIntegral(ymin) {
    let line = new Flatten.Line(this.start, this.end);
    let onLeftSide = this._center.leftTo(line);
    let segment = new Flatten.Segment(this.start, this.end);
    let areaTrapez = segment.definiteIntegral(ymin);
    let areaCircularSegment = this.circularSegmentArea();
    let area = onLeftSide ? areaTrapez - areaCircularSegment : areaTrapez + areaCircularSegment;
    return area;
  }

  circularSegmentArea() {
    return 0.5 * this.radius * this.radius * (this.sweep - Math.sin(this.sweep));
  }

  /**
   * Sort given array of points from arc start to end, assuming all points lay on the arc
   * @param {Point[]} array of points
   * @returns {Point[]} new array sorted
   */
  sortPoints(pts) {
    let { vector } = Flatten;
    return pts.slice().sort((pt1, pt2) => {
      let slope1 = vector(this._center, pt1).slope;
      let slope2 = vector(this._center, pt2).slope;
      if (slope1 < slope2) {
        return -1;
      }
      if (slope1 > slope2) {
        return 1;
      }
      return 0;
    });
  }

  /**
   * This method returns an object that defines how data will be
   * serialized when called JSON.stringify() method
   * @returns {Object}
   */
  toJSON() {
    return Object.assign({}, this, { name: "arc" });
  }

  /**
   * Return string to draw arc in svg
   * @param {Object} attrs - an object with attributes of svg path element,
   * like "stroke", "strokeWidth", "fill" <br/>
   * Defaults are stroke:"black", strokeWidth:"1", fill:"none"
   * @returns {string}
   */
  svg(attrs = {}) {
    let largeArcFlag = this.sweep <= Math.PI ? "0" : "1";
    let sweepFlag = this.counterClockwise ? "1" : "0";
    let { stroke, strokeWidth, fill, id, className } = attrs;
    // let rest_str = Object.keys(rest).reduce( (acc, key) => acc += ` ${key}="${rest[key]}"`, "");
    let id_str = id && id.length > 0 ? `id="${id}"` : "";
    let class_str = className && className.length > 0 ? `class="${className}"` : "";

    if (Flatten.Utils.EQ(this.sweep, 2 * Math.PI)) {
      let circle = new Flatten.Circle(this._center, this.radius);
      return circle.svg(attrs);
    } else {
      return `\n<path d="M${this.start.x},${this.start.y}
                             A${this.radius},${this.radius} 0 ${largeArcFlag},${sweepFlag} ${this.end.x},${this.end.y}"
                    stroke="${stroke || "black"}" stroke-width="${strokeWidth || 1}" fill="${
        fill || "none"
      }" ${id_str} ${class_str} />`;
    }
  }
}
