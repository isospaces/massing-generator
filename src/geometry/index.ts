import { Box } from "./classes/box";
import { Line } from "./classes/line";
import { Point } from "./classes/point";
import { Segment } from "./classes/segment";

export type Shape = Point | Line | Ray | Circle | Box | Segment | Arc | Polygon;
export interface Renderable {
  svg(): string;
}

export * as Constants from "./utils/constants";
export * as Utils from "./utils/utils";
export * as Errors from "./utils/errors";
