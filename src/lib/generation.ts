import Line from "./line";
import { Mesh } from "./mesh";
import { createRect } from "./utils";
import Vec2 from "./vec2";
import Random from "./random";
import Shape from "./shape";
import { PI2, cos, sin } from "./math";

const UNIT_1 = createRect(new Vec2(9.15, 9.1));
const UNIT_3 = createRect(new Vec2(3.175, 7.63));

export interface UnitGenerationOptions {
  count: number;
  spacing?: number;
}

export const generateUnitPlacement = (lines: Line[], options: UnitGenerationOptions) => {
  const { count, spacing } = { ...{ spacing: 0 }, ...options };

  console.log(count, spacing);

  const arr = [];

  const dimensions = new Vec2(9.15, 9.1);
  const padding = new Vec2(1, 1);

  let remainingUnits = count;
  for (const line of lines) {
    const maxDistance = line.distance();
    const direction = line.relative().normalise();
    const perpendicular = new Vec2(-direction.y, direction.x);
    const perpendicularOffset = perpendicular.multiplyScalar(dimensions.y / 2 + padding.y);
    const parallelOffset = dimensions.x / 2 + padding.x;
    const distanceCoefficient = dimensions.x + spacing;
    const angle = Math.atan(direction.y / direction.x);

    for (let i = 0; i < remainingUnits; i++) {
      const distance = distanceCoefficient * i + parallelOffset;
      if (distance > maxDistance - parallelOffset) break;

      const position = line.a.add(direction.multiplyScalar(distance).add(perpendicularOffset));
      arr.push(new Mesh(UNIT_1).setPosition(position).setRotation(-angle));
      remainingUnits--;
    }

    if (remainingUnits === 0) return arr;
  }

  if (remainingUnits > 0) {
    console.warn(`${remainingUnits} units were unable to fit inside the plot`);
  }

  return arr;
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
