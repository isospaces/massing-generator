import Vec2 from "./vec2";

export default class Shape {
  points: Vec2[];

  constructor(points: Vec2[]) {
    this.points = points;
  }

  multiply(value: Vec2) {
    this.points.forEach((p) => p.multiply(value));
    return this;
  }

  multiplyScalar(value: number) {
    this.points.forEach((p) => p.multiplyScalar(value));
    return this;
  }

  clone() {
    return new Shape(this.points.map((p) => p.clone()));
  }
}
