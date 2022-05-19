import { sqrt } from "./math";

export default class Vec2 extends Array<number> {
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

  static add(a: Vec2, b: Vec2) {
    return new Vec2(a.x + b.x, a.y + b.y);
  }

  static sub(a: Vec2, b: Vec2) {
    return new Vec2(a.x - b.x, a.y - b.y);
  }

  static multiply(a: Vec2, b: Vec2) {
    return new Vec2(a.x * b.x, a.y * b.y);
  }

  static multiplyScalar(a: Vec2, number: number) {
    return new Vec2(a.x * number, a.y * number);
  }

  static dot(a: Vec2, b: Vec2) {
    return a.x * b.x + a.y * b.y;
  }

  static cross(a: Vec2, b: Vec2) {
    return a.x * b.x - a.y * b.y;
  }

  dot(value: Vec2) {
    return Vec2.dot(this, value);
  }

  normalise() {
    return this.divideScalar(this.magnitude() || 1);
  }

  divideScalar(value: number) {
    return this.multiplyScalar(1 / value);
  }

  distance(value: Vec2) {
    return value.sub(this).magnitude();
  }

  negate() {
    return new Vec2(-this.x, -this.y);
  }

  orthogonal() {
    return new Vec2(this.y, -this.x);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  add(value: Vec2) {
    return Vec2.add(this, value);
  }

  sub(value: Vec2) {
    return Vec2.sub(this, value);
  }

  multiply(x: number, y: number): this;
  multiply(vector: Vec2): this;
  multiply(...args: unknown[]) {
    const value = args.length === 2 ? new Vec2(args[0] as number, args[1] as number) : (args[0] as Vec2);
    return Vec2.multiply(this, value);
  }

  multiplyScalar(value: number) {
    return Vec2.multiplyScalar(this, value);
  }

  perpendicular() {
    return new Vec2(-this.y, this.x);
  }

  clone() {
    return new Vec2(this.x, this.y);
  }
}

// pure functions
const add = (a: Vec2, b: Vec2) => new Vec2(a.x + b.x, a.y + b.y);
const sub = (a: Vec2, b: Vec2) => new Vec2(a.x - b.x, a.y - b.y);
const multiply = (a: Vec2, b: Vec2) => new Vec2(a.x * b.x, a.y * b.y);
const multiplyScalar = (a: Vec2, number: number) => new Vec2(a.x * number, a.y * number);
const dot = (a: Vec2, b: Vec2) => a.x * b.x + a.y * b.y;
const cross = (a: Vec2, b: Vec2) => a.x * b.x - a.y * b.y;
const normalize = (v: Vec2) => divideScalar(v, v.magnitude() || 1);
const divideScalar = (v: Vec2, value: number) => multiplyScalar(v, 1 / value);
const distance = (a: Vec2, b: Vec2) => b.sub(a).magnitude();
const negate = (v: Vec2) => new Vec2(-v.x, -v.y);
const orthogonal = (v: Vec2) => new Vec2(v.y, -v.x);
const magnitude = (v: Vec2) => sqrt(v.x * v.x + v.y * v.y);
const perpendicular = (v: Vec2) => new Vec2(-v.y, v.x);
