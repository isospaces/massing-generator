import Mesh from "./mesh";
import { createRect } from "./utils";
import Vector from "./vector";
import Random from "./random";
import { PI, cos, sin, mod, sqrt, acos, PI2, abs } from "./math";
import { pointsToLines, simplify } from "./geometry";

const TYPE_3 = createRect(new Vector(9.15, 9.1));
const TYPE_1 = createRect(new Vector(3.175, 7.63));
const PARKING_SPACE_SIZE = new Vector(2.4, 4.8);

export interface UnitGenerationOptions {
  count: number;
  spacing: number;
  padding: Vector;
  angularThreshold: number;
}

export const generateUnits = (plot: Mesh, options: UnitGenerationOptions) => {
  const { count, spacing, padding, angularThreshold } = options;

  const simplifiedPolygon = simplify(plot.shapeWorld, angularThreshold);
  const lines = pointsToLines(simplifiedPolygon)
    .map((line) => ({
      line,
      normal: line.relative().normalize().perpendicular(),
    }))
    .sort((a, b) => a.normal.y - b.normal.y)
    .map((data) => data.line);

  const arr: Mesh[] = [];
  const dimensions = new Vector(9.15, 9.1);
  const parallelOffset = dimensions.x / 2 + padding.x;
  const distanceCoefficient = dimensions.x + (spacing === 0 ? 0.05 : spacing);

  let remainingUnits = count;
  for (const line of lines) {
    const maxDistance = line.distance();
    const direction = line.relative().normalize();
    const perpendicular = new Vector(-direction.y, direction.x);
    const perpendicularOffset = perpendicular.multiplyScalar(dimensions.y / 2 + padding.y);
    const angle = Math.atan(direction.y / direction.x);

    for (let i = 0; i < remainingUnits; i++) {
      const distance = distanceCoefficient * i + parallelOffset;
      if (distance > maxDistance - parallelOffset) break;

      const position = line.a.add(direction.multiplyScalar(distance).add(perpendicularOffset));
      const newUnit = new Mesh(TYPE_3)
        .setPosition(position)
        .setRotation(-angle)
        .setName("Type 3")
        .setFillColor("#FADAB4");
      // const newUnit = new Mesh(TYPE_3).setPosition(position).setName("Type 3").setColor("#FADAB4");
      const noBoundaryCollision = !newUnit.intersects(plot);
      const noUnitCollision = arr.every((unit) => !newUnit.intersects(unit));

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
  const step = PI2 / pointCount;
  return Array.from(Array(pointCount)).map((p, i) => {
    const angle = step * i;
    const distance = Random.range(minRadius, maxRadius);
    return new Vector(cos(angle), sin(angle)).multiplyScalar(distance);
  });
};

export const generateParking = (bedCount: number) => {
  return bedCount;
};
