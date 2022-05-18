import Vec2 from "./vec2";

export default class Line extends Array<Vec2> {
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

  constructor(a: Vec2, b: Vec2) {
    super(2);
    this[0] = a;
    this[1] = b;
    Object.seal(this);
  }

  relative() {
    return Vec2.sub(this.b, this.a);
  }

  distance() {
    return this.relative().magnitude();
  }

  clone() {
    return new Line(this.a, this.b);
  }
}
