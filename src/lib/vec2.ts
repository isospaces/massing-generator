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
    return new Vec2(b.x - a.x, b.y - a.y);
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

  normalise() {
    return this.divideScalar(this.magnitude() || 1);
  }

  divideScalar(value: number) {
    return this.multiplyScalar(1 / value);
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