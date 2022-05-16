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

  public get area() {
    let a = 0; // Accumulates area
    const points = this.shapeWorld;
    let j = points.length - 1;

    for (let i = 0; i < points.length; i++) {
      const prev = points[j];
      const current = points[i];
      a += (prev.x + current.x) * (prev.y - current.y);
      j = i;
    }
    return a / 2;
  }

  protected updateWorldPosition() {
    this._shapeWorld = this.shape.points.map((p) => {
      let position = p.clone();
      if (this.rotation !== 0) {
        const [x, y] = position;
        const radians = this.rotation;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        position = new Vec2(cos * x + sin * y, cos * y - sin * x);
      }

      return position.add(this.position);
    });
  }
}
