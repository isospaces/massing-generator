import Vector from "./vector";
import { intersectsPolygon } from "./collision";

export default class Mesh {
  public name = "Mesh";
  public strokeColor = "#000";
  public fillColor = "#888";
  public fill = true;
  private _shape: Vector[];
  private _position = new Vector(0, 0);
  private _rotation = 0;
  private _shapeWorld: Vector[] = [];

  constructor(shape: Vector[]) {
    this._shape = shape;
    this._shapeWorld = shape;
    this.updateWorldPosition();
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

  public translatePoint(index: number, value: Vector) {
    this._shape[index] = this._shape[index].add(value);
    this.updateWorldPosition();
    return this;
  }

  public setName(value: string) {
    this.name = value;
    return this;
  }

  public setShape(value: Vector[]) {
    this._shape = value;
    this.updateWorldPosition();
    return this;
  }

  public setPosition(value: Vector) {
    this._position = value;
    this.updateWorldPosition();
    return this;
  }

  public setRotation(value: number) {
    this._rotation = value;
    this.updateWorldPosition();
    return this;
  }

  public setStrokeColor(value: string) {
    this.strokeColor = value;
    return this;
  }

  public setFillColor(value: string) {
    this.fillColor = value;
    return this;
  }

  public translate(value: Vector) {
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
    this._shapeWorld = this.shape.map((p) => {
      let position = p.clone();
      if (this.rotation !== 0) {
        const [x, y] = position;
        const radians = this.rotation;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        position = new Vector(cos * x + sin * y, cos * y - sin * x);
      }

      return position.add(this.position);
    });
  }
}
