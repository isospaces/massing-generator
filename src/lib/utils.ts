import Shape from "./shape";
import Vec2 from "./vec2";
import Line from "./line";
import { mod } from "./math";

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
  ctx.lineWidth = 1;

  return { ctx, center, width, height, dpr };
};

export const sortByNormals = (lines: Line[]) => {
  return lines
    .map((line) => ({
      line,
      normal: line.relative().normalise().perpendicular(),
    }))
    .sort((a, b) => a.normal.y - b.normal.y)
    .map((data) => data.line);
};

export const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number, offset: Vec2) => {
  ctx.strokeStyle = "#bbb";
  const step = w / 40;
  ctx.beginPath();
  for (let p = 0; p <= w; p += step) {
    const x = mod(p + offset.x, w);
    const y = mod(p + offset.y, w);
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
};
