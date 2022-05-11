export default class Vec2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static sub(a: Vec2, b: Vec2) {
    return new Vec2(b.x - a.x, b.y - a.y);
  }

  static dot(a: Vec2, b: Vec2) {
    return a.x * b.x + a.y * b.y;
  }

  normalise() {
    return this.divideScalar(this.length() || 1);
  }

  divideScalar(value: number) {
    return this.multiplyScalar(1 / value);
  }

  length() {
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

  multiply(value: Vec2) {
    this.x *= value.x;
    this.y *= value.y;
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
