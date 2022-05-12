import Vec2 from "./vec2";

export default class Shape {
  points: Vec2[];

  constructor(points: Vec2[]) {
    this.points = points;
  }

  scale(x: number, y: number): this;
  scale(vector: Vec2): this;
  scale(...args: unknown[]) {
    const factor = args.length === 2 ? new Vec2(args[0] as number, args[1] as number) : (args[0] as Vec2);
    this.points = this.points.map((p) => p.multiply(factor));
    return this;
  }

  clone() {
    return new Shape(this.points.map((p) => p.clone()));
  }
}
