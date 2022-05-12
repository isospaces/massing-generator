import Vec2 from "./vec2";

export default class Shape {
  points: Vec2[];

  constructor(points: Vec2[]) {
    this.points = points;
  }

  scale(x: number, y: number): this;
  scale(vector: Vec2): this;
  scale(...args: unknown[]) {
    const [x, y] = args.length === 2 ? (args as number[]) : (args[0] as Vec2);
    this.points.forEach((p) => p.multiply(x, y));
    return this;
  }

  clone() {
    return new Shape(this.points.map((p) => p.clone()));
  }
}
