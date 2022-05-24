import { sqrt } from "./math";

export default class Vector extends Array<number> {
  static add = (a: Vector, b: Vector) => new Vector(a.x + b.x, a.y + b.y);
  static sub = (a: Vector, b: Vector) => new Vector(a.x - b.x, a.y - b.y);
  static multiply = (a: Vector, b: Vector) => new Vector(a.x * b.x, a.y * b.y);
  static multiplyScalar = (a: Vector, number: number) => new Vector(a.x * number, a.y * number);
  static dot = (a: Vector, b: Vector) => a.x * b.x + a.y * b.y;
  static cross = (a: Vector, b: Vector) => a.x * b.x - a.y * b.y;
  static normalize = (v: Vector) => Vector.divideScalar(v, v.magnitude() || 1);
  static divideScalar = (v: Vector, value: number) => v.multiplyScalar(1 / value);
  static distance = (a: Vector, b: Vector) => b.sub(a).magnitude();
  static negate = (v: Vector) => new Vector(-v.x, -v.y);
  static orthogonal = (v: Vector) => new Vector(v.y, -v.x);
  static magnitude = (v: Vector) => sqrt(v.x * v.x + v.y * v.y);
  static perpendicular = (v: Vector) => new Vector(-v.y, v.x);
  static diff = (a: Vector, b: Vector) => b.sub(a);
  static lerp = (a: Vector, b: Vector, t: number) => a.add(Vector.diff(a, b).multiplyScalar(t));
  static midpoint = (a: Vector, b: Vector) => Vector.lerp(a, b, 0.5);

  public get x() {
    return this[0];
  }

  public set x(value) {
    this[0] = value;
  }

  public get y() {
    return this[1];
  }

  public set y(value) {
    this[1] = value;
  }

  constructor(x: number, y: number) {
    super(2);
    this[0] = x;
    this[1] = y;
    Object.seal(this);
  }

  dot(value: Vector) {
    return Vector.dot(this, value);
  }

  normalize() {
    return this.divideScalar(this.magnitude() || 1);
  }

  divideScalar(value: number) {
    return this.multiplyScalar(1 / value);
  }

  distance(value: Vector) {
    return value.sub(this).magnitude();
  }

  negate() {
    return new Vector(-this.x, -this.y);
  }

  orthogonal() {
    return new Vector(this.y, -this.x);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  add(value: Vector) {
    return Vector.add(this, value);
  }

  sub(value: Vector) {
    return Vector.sub(this, value);
  }

  multiply(x: number, y: number): this;
  multiply(vector: Vector): this;
  multiply(...args: unknown[]) {
    const value = args.length === 2 ? new Vector(args[0] as number, args[1] as number) : (args[0] as Vector);
    return Vector.multiply(this, value);
  }

  multiplyScalar(value: number) {
    return Vector.multiplyScalar(this, value);
  }

  perpendicular() {
    return new Vector(-this.y, this.x);
  }

  lerp(v: Vector, t: number) {
    return Vector.lerp(this, v, t);
  }

  toString(): string {
    return `[${this.x.toPrecision(3)}, ${this.y.toPrecision(3)}]`;
  }

  clone() {
    return new Vector(this.x, this.y);
  }
}

// pure functions
