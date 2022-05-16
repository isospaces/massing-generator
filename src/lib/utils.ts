import Shape from "./shape";
import Vec2 from "./vec2";
import Line from "./line";

export namespace COLORS {
  export const WHITE = "#ffffff";
  export const BLACK = "#000000";
  export const GREEN = "#00ff00";
  export const RED = "#ff0000";
}

export const createRect = (size: Vec2) => {
  return new Shape([new Vec2(-0.5, -0.5), new Vec2(-0.5, 0.5), new Vec2(0.5, 0.5), new Vec2(0.5, -0.5)]).scale(size);
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
