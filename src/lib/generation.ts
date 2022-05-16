import Line from "./line";
import { Mesh } from "./mesh";
import { createRect, sortByNormals } from "./utils";
import Vec2 from "./vec2";
import Random from "./random";
import Shape from "./shape";
import { PI2, cos, sin } from "./math";
import { shapeToLines } from "./collision";

const TYPE_3 = createRect(new Vec2(9.15, 9.1));
const TYPE_1 = createRect(new Vec2(3.175, 7.63));
const PARKING_SPACE_SIZE = new Vec2(2.4, 4.8);

export interface UnitGenerationOptions {
  count: number;
  spacing: number;
  padding: Vec2;
}

export const generateUnitPlacement = (plot: Mesh, options: UnitGenerationOptions) => {
  const lines = sortByNormals(shapeToLines(plot.shapeWorld));
  const { count, spacing, padding } = options;
  const arr: Mesh[] = [];

  const dimensions = new Vec2(9.15, 9.1);

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
      const newUnit = new Mesh(TYPE_3).setPosition(position).setRotation(-angle).setName("Type 3");
      const noBoundaryCollision = !newUnit.intersects(plot);
      const noUnitCollision = arr.every((unit) => !newUnit.intersects(unit));
      // arr.forEach((unit) => {
      //   const intersecting = newUnit.intersects(unit);
      //   if (intersecting) {
      //     unit.color = "#f00";
      //     newUnit.color = "#f00";
      //   }
      // });

      if (noBoundaryCollision && noUnitCollision) {
        arr.push(newUnit);
        remainingUnits--;
      }
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

export const generateParking = (bedCount: number) => {
  return bedCount;
};
