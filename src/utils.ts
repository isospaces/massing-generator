export type Point = [number, number];
export type Line = [Point, Point];

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

export const intersectsShape = (shape1: Point[], shape2: Point[]) => {
  const lines1 = shapeToLines(shape1);
  const lines2 = shapeToLines(shape2);

  for (let a of lines1) {
    for (let b of lines2) {
      if (intersects(a, b)) return true;
    }
  }

  return false;
};

const shapeToLines = (shape: Point[]) => {
  const lines = new Array<Line>();
  for (let i = 0; i < shape.length - 1; i++) {
    lines.push([shape[i], shape[i + 1]]);
  }
  // final line
  lines.push([shape[shape.length - 1], shape[0]]);
  return lines;
};

export class Shape {
  points: Point[];
  position: Point;

  public get world(): Point[] {
    const pos = this.position;
    return this.points.map((p) => [pos[0] + p[0], pos[1] + p[1]]);
  }

  constructor(points: Point[], position = [0, 0] as Point) {
    this.points = points;
    this.position = position;
  }

  render = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.moveTo(this.position[0] + this.points[0][0], this.position[1] + this.points[0][1]);
    for (const p of this.points) {
      ctx.lineTo(this.position[0] + p[0], this.position[1] + p[1]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
}
