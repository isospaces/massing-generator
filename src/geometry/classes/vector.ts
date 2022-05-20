import { EQ, EQ_0 } from "../utils/utils";
import { Line } from "./line";

/** A 2-dimensional vector */
export class Vector {
  x = 0;
  y = 0;

  /**
   * Vector may be constructed by two points, or by two float numbers,
   * or by array of two numbers
   * @param {Point} ps - start point
   * @param {Point} pe - end point
   */
  constructor(x: number, y: number);
  constructor(...args: [number, number] | Vector[]) {
    if (typeof args[0] === "number" && typeof args[1] === "number") {
      this.x = args[0];
      this.y = args[1];
    } else 
      this.x = args[1].x - args[0].x;
      this.y = args[1].y - args[0].y;
    }
  }

  /** Method clone returns new instance of Vector */
  clone() {
    return new Vector(this.x, this.y);
  }

  /** Slope of the vector in radians from 0 to 2PI */
  get slope() {
    let angle = Math.atan2(this.y, this.x);
    if (angle < 0) angle = 2 * Math.PI + angle;
    return angle;
  }

  /** Length of vector */
  get length() {
    return Math.sqrt(this.dot(this));
  }

  /** Returns projection point on given line */

  /** Returns true if vectors are equal up to DP_TOL (tolerance) */
  equalTo(v: Vector) {
    return EQ(this.x, v.x) && EQ(this.y, v.y);
  }

  /** Returns new vector multiplied by scalar */
  multiply(scalar: number) {
    return new Vector(scalar * this.x, scalar * this.y);
  }

  /**
   * Returns scalar product (dot product) of two vectors <br/>
   * ```dot_product = (this * v)```
   */
  dot(v: Vector) {
    return this.x * v.x + this.y * v.y;
  }

  /** Returns vector product (cross product) of two vectors */
  cross(v: Vector) {
    return this.x * v.y - this.y * v.x;
  }

  /** Returns unit vector. */
  normalize() {
    return EQ_0(this.length) ? new Vector(0, 0) : new Vector(this.x / this.length, this.y / this.length);
  }

  /**
   * Returns new vector rotated by given angle,
   * positive angle defines rotation in counter clockwise direction,
   * negative - in clockwise direction
   */
  rotate(angle: number, center = { x: 0, y: 0 }) {
    const x_rot = center.x + (this.x - center.x) * Math.cos(angle) - (this.y - center.y) * Math.sin(angle);
    const y_rot = center.y + (this.x - center.x) * Math.sin(angle) + (this.y - center.y) * Math.cos(angle);
    return new Vector(x_rot, y_rot);
  }

  /** Returns vector rotated 90 degrees counter clockwise */
  rotate90CCW() {
    return new Vector(-this.y, this.x);
  }

  /** Returns vector rotated 90 degrees clockwise */
  rotate90CW() {
    return new Vector(this.y, -this.x);
  }

  /** Return inverted vector */
  invert() {
    return new Vector(-this.x, -this.y);
  }

  /** Return result of addition of other vector to this vector as a new vector */
  add(v: Vector) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  /** Return result of subtraction of other vector from current vector as a new vector */
  subtract(v: Vector) {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  /**
   * Return angle between this vector and other vector. <br/>
   * Angle is measured from 0 to 2*PI in the counter clockwise direction
   * from current vector to other.
   */
  angleTo(v: Vector) {
    let norm1 = this.normalize();
    let norm2 = v.normalize();
    let angle = Math.atan2(norm1.cross(norm2), norm1.dot(norm2));
    if (angle < 0) angle += 2 * Math.PI;
    return angle;
  }

  /** Return vector projection of the current vector on another vector */
  projectionOn(l: Line);
  projectionOn(v: Vector);
  projectionOn(arg: Vector | Line) {
    if (arg instanceof Vector) {
      let n = v.normalize();
      let d = this.dot(n);
      return n.multiply(d);
    }

    if (this.equalTo(arg.pt))
      // this point equal to line anchor point
      return this.clone();

    let vec = new Vector(this, arg.pt);
    if (EQ_0(vec.cross(arg.norm)))
      // vector to point from anchor point collinear to normal vector
      return arg.pt.clone();

    let dist = vec.dot(arg.norm); // signed distance
    let proj_vec = arg.norm.multiply(dist);
    return this.add(proj_vec);
  }

  /**
   * This method returns an object that defines how data will be
   * serialized when called JSON.stringify() method
   * @returns {Object}
   */
  toJSON() {
    return Object.assign({}, this, { name: "vector" });
  }
}

export const vector = (...args: any) => new Vector(...args);
