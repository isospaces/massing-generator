import Line from "./line";
import { Mesh } from "./mesh";
import { createRect, sortByNormals } from "./utils";
import Vec2 from "./vec2";
import Random from "./random";
import { PI, cos, sin, mod, sqrt, acos, PI2 } from "./math";
import { shapeToLines } from "./collision";

const TYPE_3 = createRect(new Vec2(9.15, 9.1));
const TYPE_1 = createRect(new Vec2(3.175, 7.63));
const PARKING_SPACE_SIZE = new Vec2(2.4, 4.8);

export interface UnitGenerationOptions {
  count: number;
  spacing: number;
  padding: Vec2;
  angularThreshold: number;
}

export const angleFromPoints = (a: Vec2, b: Vec2, c: Vec2) => {
  const vecA = b.sub(a).normalise();
  const vecB = c.sub(b).normalise();
  return acos(vecA.dot(vecB) / (vecA.magnitude() * vecB.magnitude()));
};

export const simplifyPolygon = (polygon: Vec2[], angularThreshold: number) => {
  const simplified = new Array<Vec2>();
  const getPoint = (value: number) => polygon[mod(value, polygon.length)];
  for (let i = 0; i < polygon.length; i++) {
    const prev = getPoint(i - 1);
    const current = getPoint(i);
    const next = getPoint(i + 1);

    if (angleFromPoints(prev, current, next) > angularThreshold) {
      simplified.push(current);
    }
    console.log(`${i}/${polygon.length}`);
  }
  return simplified;
};

export const generateUnitPlacement = (plot: Mesh, options: UnitGenerationOptions) => {
  const { count, spacing, padding, angularThreshold } = options;
  const polygon = simplifyPolygon(plot.shapeWorld, angularThreshold);
  const lines = shapeToLines(polygon);
  const sortedLines = lines
    .map((line) => ({
      line,
      normal: line.relative().normalise().perpendicular(),
    }))
    .sort((a, b) => a.normal.y - b.normal.y)
    .map((data) => data.line);

  const arr: Mesh[] = [];
  const dimensions = new Vec2(9.15, 9.1);

  let remainingUnits = count;
  for (const line of sortedLines) {
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
      const newUnit = new Mesh(TYPE_3).setPosition(position).setRotation(-angle).setName("Type 3").setColor("#FADAB4");
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
    return new Vec2(cos(angle), sin(angle)).multiplyScalar(distance);
  });
};

export const generateParking = (bedCount: number) => {
  return bedCount;
};
