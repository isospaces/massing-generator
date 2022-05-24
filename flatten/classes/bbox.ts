import { abs, max, min } from "../../src/lib/math";
import { Segment } from "./segment";
import { Vector } from "./vector";

export class Box {
  static comparableMax = (a: Box, b: Box) => a.merge(b);
  static comparableLessThan = (a: Box, b: Box) => a.lessThan(b);

  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;

  constructor(xmin: number, ymin: number, xmax: number, ymax: number) {
    this.xmin = xmin;
    this.ymin = ymin;
    this.xmax = xmax;
    this.ymax = ymax;
  }

  /** Return new cloned instance of box */
  clone() {
    return new Box(this.xmin, this.ymin, this.xmax, this.ymax);
  }

  /** Property low need for interval tree interface */
  get low() {
    return new Vector(this.xmin, this.ymin);
  }

  /** Property high need for interval tree interface */
  get high() {
    return new Vector(this.xmax, this.ymax);
  }

  /** Property max returns the box itself ! **/
  get max() {
    return this.clone();
  }

  /** Return center of the box */
  get center() {
    return new Vector((this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2);
  }

  /** Return the width of the box */
  get width() {
    return abs(this.xmax - this.xmin);
  }

  /** Return the height of the box */
  get height() {
    return abs(this.ymax - this.ymin);
  }

  /** Return property box like all other shapes */
  get box() {
    return this.clone();
  }

  /** Returns true if not intersected with other box */
  notIntersecting(box: Box) {
    return this.xmax < box.xmin || this.xmin > box.xmax || this.ymax < box.ymin || this.ymin > box.ymax;
  }

  /** Returns true if intersected with other box */
  intersecting(box: Box) {
    return !this.notIntersecting(box);
  }

  /** Returns new box merged with other box */
  merge(box: Box) {
    return new Box(
      this.xmin === undefined ? box.xmin : min(this.xmin, box.xmin),
      this.ymin === undefined ? box.ymin : min(this.ymin, box.ymin),
      this.xmax === undefined ? box.xmax : max(this.xmax, box.xmax),
      this.ymax === undefined ? box.ymax : max(this.ymax, box.ymax)
    );
  }

  /** Defines predicate "less than" between two boxes. Need for interval index */
  lessThan(box: Box) {
    if (this.low.lessThan(box.low)) return true;
    if (this.low.equalTo(box.low) && this.high.lessThan(box.high)) return true;
    return false;
  }

  /** Returns true if this box is equal to other box, false otherwise */
  equalTo(box: Box) {
    return this.low.equalTo(box.low) && this.high.equalTo(box.high);
  }

  output() {
    return this.clone();
  }

  /** Set new values to the box object */
  set(xmin: number, ymin: number, xmax: number, ymax: number) {
    this.xmin = xmin;
    this.ymin = ymin;
    this.xmax = xmax;
    this.ymax = ymax;
  }

  /** Transform box into array of points from low left corner in counter clockwise */
  toPoints() {
    return [
      new Vector(this.xmin, this.ymin),
      new Vector(this.xmax, this.ymin),
      new Vector(this.xmax, this.ymax),
      new Vector(this.xmin, this.ymax),
    ];
  }

  /** Transform box into array of segments from low left corner in counter clockwise */
  toSegments() {
    const points = this.toPoints();
    return [
      new Segment(points[0], points[1]),
      new Segment(points[1], points[2]),
      new Segment(points[2], points[3]),
      new Segment(points[3], points[0]),
    ];
  }

  /**
   * Return string to draw circle in svg
   * @param {Object} attrs - an object with attributes of svg rectangle element,
   * like "stroke", "strokeWidth", "fill" <br/>
   * Defaults are stroke:"black", strokeWidth:"1", fill:"none"
   */
  svg(attrs = {}) {
    const { stroke, strokeWidth, fill, id, className } = attrs as any;
    // let rest_str = Object.keys(rest).reduce( (acc, key) => acc += ` ${key}="${rest[key]}"`, "");
    let id_str = id && id.length > 0 ? `id="${id}"` : "";
    let class_str = className && className.length > 0 ? `class="${className}"` : "";
    let width = this.xmax - this.xmin;
    let height = this.ymax - this.ymin;

    return `\n<rect x="${this.xmin}" y="${this.ymin}" width=${width} height=${height} stroke="${
      stroke || "black"
    }" stroke-width="${strokeWidth || 1}" fill="${fill || "none"}" ${id_str} ${class_str} />`;
  }
}
