import Vec2 from "./vec2";
import Line from "./line";

export namespace COLORS {
  export const WHITE = "#ffffff";
  export const BLACK = "#000000";
  export const GREEN = "#00ff00";
  export const RED = "#ff0000";
}

export const createRect = (size: Vec2) => {
  return [new Vec2(-0.5, -0.5), new Vec2(-0.5, 0.5), new Vec2(0.5, 0.5), new Vec2(0.5, -0.5)].map((p) =>
    p.multiply(size)
  );
};

export const sortByNormals = (lines: Line[]) => {
  return lines;
};
