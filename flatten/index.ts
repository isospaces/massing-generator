import { Box } from "./classes/bbox";
import { Line } from "./classes/line";
import { Polygon } from "./classes/polygon";
import { Segment } from "./classes/segment";

export type Shape = Line | Box | Segment | Polygon;
export interface Renderable {
  svg(): string;
}

export * as Constants from "./utils/constants";
export * as Utils from "./utils/utils";
export * as Errors from "./utils/errors";
