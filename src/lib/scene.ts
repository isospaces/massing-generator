import Vec2 from "./vec2";

export interface RenderArguments {
  ctx: CanvasRenderingContext2D;
  dimensions: Vec2;
  center: Vec2;
}
