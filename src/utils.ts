import Shape from "./shape";
import Vec2 from "./vec2";

export type Line = [Vec2, Vec2];

export namespace COLORS {
  export const WHITE = "#ffffff";
  export const BLACK = "#000000";
  export const GREEN = "#00ff00";
  export const RED = "#ff0000";
}

export namespace SHAPES {
  export const RECTANGLE = new Shape([new Vec2(-1, -1), new Vec2(-1, 1), new Vec2(1, 1), new Vec2(1, -1)]);
}

export const intersects = (line1: Line, line2: Line) => {
  if (!line1 || !line2) return null;

  const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = line1;
  const [{ x: x3, y: y3 }, { x: x4, y: y4 }] = line2;

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

export const shapeToLines = (shape: Vec2[]) => {
  const lines = new Array<Line>();
  for (let i = 0; i < shape.length - 1; i++) {
    lines.push([shape[i], shape[i + 1]]);
  }
  // final line
  lines.push([shape[shape.length - 1], shape[0]]);
  return lines;
};

export const setupCanvas = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const center = new Vec2(width / 2, height / 2);

  // setup canvas size and dpr
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  return { ctx, center, width, height };
};
