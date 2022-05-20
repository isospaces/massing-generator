import { Mesh, mesh } from "./mesh";
import Vec2 from "./vec2";
import Random from "./random";
import { PI, cos, sin, mod, sqrt, acos, PI2, abs } from "./math";
import GEO from "@flatten-js/core";

const { vector, Box, Polygon } = GEO;

const box = (w: number, h: number) => new Box(-w / 2, h / 2, w / 2, -h / 2);

const TYPE_3 = new Polygon(box(9.15, 9.1));
const TYPE_1 = new Polygon(box(3.175, 7.63));
const PARKING_SPACE_SIZE = vector(2.4, 4.8);

export interface UnitGenerationOptions {
  count: number;
  spacing: number;
  padding: GEO.Vector;
  angularThreshold: number;
}

export const generateUnits = (plot: Mesh, options: UnitGenerationOptions) => {
  const { count, spacing, padding, angularThreshold } = options;

  const edges = [...plot.poly.edges]
    .map(({ shape, length }: GEO.Edge) => {
      const a = (shape as GEO.Segment).ps;
      const b = (shape as GEO.Segment).pe;
      const direction = vector(b.x - a.x, (b.y = a.y)).normalize();
      const normal = direction.rotate90CW();

      return {
        a,
        b,
        length,
        direction,
        normal,
      };
    })
    .sort((a, b) => a.normal.y - b.normal.y);

  const arr: Mesh[] = [];
  const dimensions = new Vec2(9.15, 9.1);
  const parallelOffset = dimensions.x / 2 + padding.x;
  const distanceCoefficient = dimensions.x + (spacing === 0 ? 0.05 : spacing);

  let remainingUnits = count;
  for (const line of edges) {
    const maxDistance = line.length;
    const direction = line.direction;
    const perpendicular = vector(-direction.y, direction.x);
    const perpendicularOffset = perpendicular.multiply(dimensions.y / 2 + padding.y);
    const angle = Math.atan(direction.y / direction.x);

    for (let i = 0; i < remainingUnits; i++) {
      const distance = distanceCoefficient * i + parallelOffset;
      if (distance > maxDistance - parallelOffset) break;

      const position = line.a.translate(direction.multiply(distance).add(perpendicularOffset));
      const newUnit = mesh(TYPE_3, {
        name: "Type 3",
        position,
        rotation: -angle,
        fillColor: "#FADAB4",
      });

      const noBoundaryCollision = !newUnit.poly.intersect(plot.poly);
      const noUnitCollision = arr.every((unit) => !newUnit.poly.intersect(unit.poly));

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
    return new Vec2(cos(angle), sin(angle)).multiplyScalar(distance);
  });
};

export const generateParking = (bedCount: number) => {
  return bedCount;
};
