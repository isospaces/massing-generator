import Shape from "./shape";
import Vec2 from "./vec2";
import Random from "./random";
import Line from "./line";

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

export const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  ctx.strokeStyle = "#333";

  for (let x = 0; x <= w; x += 20) {
    for (let y = 0; y <= h; y += 20) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }
};
