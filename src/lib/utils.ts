import Shape from "./shape";
import Vec2 from "./vec2";
import Random from "./random";

const PI2 = Math.PI * 2;
const { sin, cos, atan } = Math;

export namespace COLORS {
  export const WHITE = "#ffffff";
  export const BLACK = "#000000";
  export const GREEN = "#00ff00";
  export const RED = "#ff0000";
}

export namespace SHAPES {
  export const RECTANGLE = new Shape([new Vec2(-1, -1), new Vec2(-1, 1), new Vec2(1, 1), new Vec2(1, -1)]);
}

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

  // antialising
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // line style
  ctx.lineCap = "round";
  ctx.lineWidth = 2;

  return { ctx, center, width, height };
};

export const generatePolygon = (minPoints: number, maxPoints: number, minRadius: number, maxRadius: number) => {
  const pointCount = Random.range(minPoints, maxPoints);
  const points: Vec2[] = [];
  const step = PI2 / pointCount;
  for (let i = 0; i < pointCount; i++) {
    const angle = step * i;
    const distance = Random.range(minRadius, maxRadius);
    const point = new Vec2(cos(angle), sin(angle)).multiplyScalar(distance);
    points.push(point);
  }

  return new Shape(points);
};
