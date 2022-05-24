import Vector from "./vector";

/** Line Segment */
export default class Segment extends Array<Vector> {
  public get a() {
    return this[0];
  }

  public set a(value) {
    this[0] = value;
  }

  public get b() {
    return this[1];
  }

  public set b(value) {
    this[1] = value;
  }

  constructor(a: Vector, b: Vector) {
    super(2);
    this[0] = a;
    this[1] = b;
    Object.seal(this);
  }

  relative() {
    return Vector.sub(this.b, this.a);
  }

  distance() {
    return this.relative().magnitude();
  }

  toString(): string {
    return `${this.a} - ${this.b}`;
  }

  clone() {
    return new Segment(this.a, this.b);
  }
}
