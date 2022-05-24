import { pointsToLines } from "./geometry";
import Segment from "./segment";
import Vector from "./vector";

export const intersects = (a: Segment, b: Segment) => {
  if (!a || !b) return null;

  const [[x1, y1], [x2, y2]] = a;
  const [[x3, y3], [x4, y4]] = b;

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

export const intersectsPolygon = (a: Vector[], b: Vector[]) => {
  const lines1 = pointsToLines(a);
  const lines2 = pointsToLines(b);

  for (const a of lines1) {
    for (const b of lines2) {
      if (intersects(a, b)) return true;
    }
  }

  return false;
};
