export type Vec2 = [number, number];
export type Line = [Vec2, Vec2];
export type Shape = Vec2[];

export namespace COLORS {
  export const BLACK = "#000000";
  export const GREEN = "#00ff00";
  export const RED = "#ff0000";
}

export namespace SHAPES {
  export const RECTANGLE: Shape = [
    [-1, -1],
    [-1, 1],
    [1, 1],
    [1, -1],
  ];
  export const DIAMOND: Shape = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];
}

export const intersects = (line1: Line, line2: Line) => {
  if (!line1 || !line2) return null;

  const [[x1, y1], [x2, y2]] = line1;
  const [[x3, y3], [x4, y4]] = line2;

  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  const numeA = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
  const numeB = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);

  if (denom === 0) {
    if (numeA === 0 && numeB === 0) {
      return null;
    }
    return null;
  }

  const uA = numeA / denom;
  const uB = numeB / denom;

  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    const x = x1 + uA * (x2 - x1);
    const y = y1 + uA * (y2 - y1);
    return [x, y];
  }
  return null;
};

export const intersectsShape = (shape1: Vec2[], shape2: Vec2[]) => {
  const lines1 = shapeToLines(shape1);
  const lines2 = shapeToLines(shape2);

  for (let a of lines1) {
    for (let b of lines2) {
      if (intersects(a, b)) return true;
    }
  }

  return false;
};

const shapeToLines = (shape: Vec2[]) => {
  const lines = new Array<Line>();
  for (let i = 0; i < shape.length - 1; i++) {
    lines.push([shape[i], shape[i + 1]]);
  }
  // final line
  lines.push([shape[shape.length - 1], shape[0]]);
  return lines;
};

export class Unit {
  public shape: Shape;
  public color: string = "#000000";
  private _position: Vec2 = [0, 0];
  private _shapeWorld: Shape;

  constructor(shape: Shape) {
    this.shape = shape;
    this._shapeWorld = shape;
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
    this._shapeWorld = this.shape.map((p) => [value[0] + p[0], value[1] + p[1]]);
    return this;
  }

  public translate(value: Vec2) {
    this.position = addVec2(this._position, value);
  }

  public intersects(...units: Unit[]) {
    return units.every((u) => intersectsShape(this._shapeWorld, u.shapeWorld));
  }

  public render(ctx: CanvasRenderingContext2D) {
    const [first, ...shape] = this._shapeWorld;

    // color
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color + "66";

    // path
    ctx.beginPath();
    ctx.moveTo(first[0], first[1]);
    for (const p of shape) {
      ctx.lineTo(p[0], p[1]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

export const scaleShape = (shape: Shape, scale: [number, number]): Shape => {
  return shape.map((p) => [p[0] * scale[0], p[1] * scale[1]]);
};

export const addVec2 = (a: Vec2, b: Vec2): Vec2 => {
  return [a[0] + b[0], a[1] + b[1]];
};
