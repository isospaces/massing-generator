import { Shape } from "..";
import {
  line2Arc,
  line2Box,
  intersectLine2Circle,
  line2Line,
  intersectLine2Polygon,
  segment2Line,
} from "../algorithms/intersection";
import Errors from "../utils/errors";
import { EQ_0 } from "../utils/utils";
import { Point } from "./point";
import { Vector } from "./vector";

export class Line {
  /** Point a line passes through */
  pt = new Vector(0, 0);
  /**
   * Normal vector to a line <br/>
   * Vector is normalized (length == 1)<br/>
   * Direction of the vector is chosen to satisfy inequality norm * p >= 0
   */
  norm = new Vector(0, 1);

  /** Line may be constructed by point and normal vector or by two points that a line passes through */
  constructor(a: Vector, b: Vector) {
    if (args.length == 1 && args[0] instanceof Object && args[0].name === "line") {
      let { pt, norm } = args[0];
      this.pt = new Vector(pt);
      this.norm = new Vector(norm);
      return;
    }

    if (args.length == 2) {
      let a1 = args[0];
      let a2 = args[1];

      if (a1 instanceof Point && a2 instanceof Point) {
        this.pt = a1;
        this.norm = Line.points2norm(a1, a2);
        if (this.norm.dot(new Vector(this.pt.x, this.pt.y)) >= 0) {
          this.norm.invert();
        }
        return;
      }

      if (a1 instanceof Point && a2 instanceof Vector) {
        if (EQ_0(a2.x) && EQ_0(a2.y)) {
          throw Errors.ILLEGAL_PARAMETERS;
        }
        this.pt = a1.clone();
        this.norm = a2.clone();
        this.norm = this.norm.normalize();
        if (this.norm.dot(vector(this.pt.x, this.pt.y)) >= 0) {
          this.norm.invert();
        }
        return;
      }

      if (a1 instanceof Vector && a2 instanceof Point) {
        if (EQ_0(a1.x) && EQ_0(a1.y)) {
          throw Errors.ILLEGAL_PARAMETERS;
        }
        this.pt = a2.clone();
        this.norm = a1.clone();
        this.norm = this.norm.normalize();
        if (this.norm.dot(new Vector(this.pt.x, this.pt.y)) >= 0) {
          this.norm.invert();
        }
        return;
      }
    }
  }

  /** Return new cloned instance of line */
  clone() {
    return new Line(this.pt, this.norm);
  }

  // The following methods need for implementation of Edge interface
  /** Line has no start point */
  get start() {
    return undefined;
  }

  /** Line has no end point */
  get end() {
    return undefined;
  }

  /** Return positive infinity number as length */
  get length() {
    return Number.POSITIVE_INFINITY;
  }

  /** Returns infinite box */
  get box() {
    return new Box(
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY
    );
  }

  /** Middle point is undefined */
  get middle() {
    return undefined;
  }

  /** Slope of the line - angle in radians between line and axe x from 0 to 2PI */
  get slope() {
    let vec = new Vector(this.norm.y, -this.norm.x);
    return vec.slope;
  }

  /** Get coefficients [A,B,C] of a standard line equation in the form Ax + By = C */
  get standard(): [number, number, number] {
    return [this.norm.x, this.norm.y, this.norm.dot(this.pt)];
  }

  /**
   * Return true if parallel or incident to other line
   * @param {Line} line - line to check
   * @returns {boolean}
   */
  parallelTo(line: Line) {
    return EQ_0(this.norm.cross(line.norm));
  }

  /** Returns true if incident to other line */
  incidentTo(line: Line) {
    return this.parallelTo(line) && this.pt.on(line);
  }

  /** Returns true if point belongs to line */
  contains(pt: Vector) {
    if (this.pt.equalTo(pt)) {
      return true;
    }
    /* Line contains point if vector to point is orthogonal to the line normal vector */
    const vec = new Vector(this.pt, pt);
    return EQ_0(this.norm.dot(vec));
  }

  /**
   * Return coordinate of the point that lays on the line in the transformed
   * coordinate system where center is the projection of the point(0,0) to
   * the line and axe y is collinear to the normal vector. <br/>
   * This method assumes that point lays on the line and does not check it
   * @param {Point} pt - point on line
   */
  coord(pt: Vector) {
    return pt.cross(this.norm);
  }

  /** Returns array of intersection points **/
  intersect(shape: Shape) {
    if (shape instanceof Vector) {
      return this.contains(shape) ? [shape] : [];
    }

    if (shape instanceof Line) {
      return line2Line(this, shape);
    }

    if (shape instanceof Circle) {
      return intersectLine2Circle(this, shape);
    }

    if (shape instanceof Box) {
      return line2Box(this, shape);
    }

    if (shape instanceof Segment) {
      return segment2Line(shape, this);
    }

    if (shape instanceof Arc) {
      return line2Arc(this, shape);
    }

    if (shape instanceof Polygon) {
      return intersectLine2Polygon(this, shape);
    }
  }

  /**
   * Calculate distance and shortest segment from line to shape and returns array [distance, shortest_segment]
   * @param {Shape} shape Shape of the one of the types Point, Circle, Segment, Arc, Polygon
   * @returns {Number}
   * @returns {Segment}
   */
  distanceTo(shape: Shape) {
    if (shape instanceof Vector) {
      let [distance, shortest_segment] = Distance.point2line(shape, this);
      shortest_segment = shortest_segment.reverse();
      return [distance, shortest_segment];
    }

    if (shape instanceof Circle) {
      let [distance, shortest_segment] = Distance.circle2line(shape, this);
      shortest_segment = shortest_segment.reverse();
      return [distance, shortest_segment];
    }

    if (shape instanceof Segment) {
      let [distance, shortest_segment] = Distance.segment2line(shape, this);
      return [distance, shortest_segment.reverse()];
    }

    if (shape instanceof Arc) {
      let [distance, shortest_segment] = Distance.arc2line(shape, this);
      return [distance, shortest_segment.reverse()];
    }

    if (shape instanceof Polygon) {
      let [distance, shortest_segment] = Distance.shape2polygon(this, shape);
      return [distance, shortest_segment];
    }
  }

  /**
   * Split line with array of points and return array of shapes
   * Assumed that all points lay on the line
   */
  split(points: Vector[]) {
    if (points.length === 1) {
      return [new Ray(points[0], this.norm.invert()), new Ray(points[0], this.norm)];
    } else {
      let multiline = new Multiline([this]);
      let sorted_points = this.sortPoints(points);
      multiline.split(sorted_points);
      return multiline.toShapes();
    }
  }

  /**
   * Sort given array of points that lay on line with respect to coordinate on a line
   * The method assumes that points lay on the line and does not check this
   */
  sortPoints(points: Vector[]) {
    return points.slice().sort((pt1, pt2) => {
      if (this.coord(pt1) < this.coord(pt2)) {
        return -1;
      }
      if (this.coord(pt1) > this.coord(pt2)) {
        return 1;
      }
      return 0;
    });
  }

  /**
   * This method returns an object that defines how data will be
   * serialized when called JSON.stringify() method
   */
  toJSON() {
    return Object.assign({}, this, { name: "line" });
  }

  /**
   * Return string to draw svg segment representing line inside given box
   */
  svg(box: Box, attrs = {}) {
    const intersection = line2Box(this, box);
    if (intersection.length === 0) return "";
    const start = intersection[0];
    const end = (intersection.length == 2 ? intersection[1] : intersection.find((pt) => !pt.equalTo(start))) ?? start;
    const segment = new Segment(start, end);
    return segment.svg(attrs);
  }

  static points2norm(a: Vector, b: Vector) {
    if (a.equalTo(b)) throw Errors.ILLEGAL_PARAMETERS;
    const vec = new Vector(a, b);
    const unit = vec.normalize();
    return unit.rotate90CCW();
  }
}
