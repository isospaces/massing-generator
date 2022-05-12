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
    this.x += value.x;
    this.y += value.y;
    return this;
  }

  subtract(value: Vec2) {
    this.x -= value.x;
    this.y -= value.y;
    return this;
  }

  multiply(x: number, y: number): this;
  multiply(vector: Vec2): this;
  multiply(...args: unknown[]) {
    const [x, y] = args.length === 2 ? (args as number[]) : (args[0] as Vec2);
    this.x *= x;
    this.y *= y;
    return this;
  }

  multiplyScalar(value: number) {
    this.x *= value;
    this.y *= value;
    return this;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }
}
