import Shape from "./shape";
import Vec2 from "./vec2";
import { intersectsPolygon } from "./collision";

export class Mesh {
  public color: string = "#888";
  private _shape: Shape;
  private _position = new Vec2(0, 0);
  private _rotation = 0;
  private _shapeWorld: Vec2[];

  constructor(shape: Shape) {
    this._shape = shape;
    this._shapeWorld = shape.points;
  }

  public get shape() {
    return this._shape;
  }

  public get shapeWorld() {
    return this._shapeWorld;
  }

  public get position() {
    return this._position;
  }

  public get rotation() {
    return this._rotation;
  }

  public set shape(value) {
    this.setShape(value);
  }

  public set position(value) {
    this.setPosition(value);
  }

  public set rotation(value) {
    this.setRotation(value);
  }

  public setShape(value: Shape) {
    this._shape = value;
    this.updateWorldPosition();
    return this;
  }

  public setPosition(value: Vec2) {
    this._position = value;
    this.updateWorldPosition();
    return this;
  }

  public setRotation(value: number) {
    this._rotation = value;
    this.updateWorldPosition();
    return this;
  }

  public setColor(value: string) {
    this.color = value;
    return this;
  }

  public translate(value: Vec2) {
    this.position = this._position.add(value);
  }

  public intersects(...units: this[]) {
    return units.every((u) => intersectsPolygon(this._shapeWorld, u.shapeWorld));
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

    // draw vertices and origin
    ctx.fillStyle = "#000";
    for (const { x, y } of this._shapeWorld) {
      ctx.beginPath();
      ctx.ellipse(x, y, 3, 3, 0, 0, 360);
      ctx.fill();
    }

    const [ox, oy] = this._position;

    ctx.beginPath();
    ctx.ellipse(ox, oy, 5, 5, 0, 0, 360);
    ctx.fill();
  }

  protected updateWorldPosition() {
    this._shapeWorld = this.shape.points.map((p) => {
      if (this.rotation !== 0) {
        const [x, y] = p;
        const radians = this.rotation;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const point = new Vec2(cos * x + sin * y, cos * y - sin * x);
        return point.add(this.position);
      }

      return p.add(this.position);
    });
  }
}
