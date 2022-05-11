import Shape from "./shape";
import Vec2 from "./vec2";
import { intersectsShape } from "./utils";

export default class Unit {
  public shape: Shape;
  public color: string = "#888";
  private _position = new Vec2(0, 0);
  private _shapeWorld: Vec2[];

  constructor(shape: Shape) {
    this.shape = shape;
    this._shapeWorld = shape.points;
  }

  public get shapeWorld() {
    return this._shapeWorld;
  }
  public get position() {
    return this._position;
  }

  public set position(value) {
    this.setPosition(value);
  }

  public setPosition(value: Vec2) {
    this._position = value;
    this._shapeWorld = this.shape.points.map((p) => p.clone().add(value));
    return this;
  }

  public translate(value: Vec2) {
    this.position = this._position.add(value);
  }

  public intersects(...units: Unit[]) {
    return units.every((u) => intersectsShape(this._shapeWorld, u.shapeWorld));
  }

  public render(ctx: CanvasRenderingContext2D) {
    const [first, ...shape] = this._shapeWorld;

    // color
    ctx.strokeStyle = "#000";
    ctx.fillStyle = this.color;

    // path
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (const { x, y } of shape) {
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
