import Line from "./line";
import { Mesh } from "./mesh";
import { SHAPES } from "./utils";
import Vec2 from "./vec2";
import Random from "./random";
import Shape from "./shape";
import { PI2, cos, sin } from "./math";

const UNIT_1 = SHAPES.RECTANGLE.clone().scale(new Vec2(20, 60));
const UNIT_3 = SHAPES.RECTANGLE.clone().scale(new Vec2(60, 60));

export const generateUnitPlacement = (count: number, lines: Line[], spacing: number) => {
  const shapes = [UNIT_1, UNIT_3];
  const arr = [];

  const dimensions = new Vec2(40, 120);
  const padding = new Vec2(20, 20);

  let remainingUnits = count;
  for (const line of lines) {
    const maxDistance = line.distance();
    const direction = line.relative().normalise();
    const perpendicular = new Vec2(-direction.y, direction.x);
    const inset = perpendicular.multiplyScalar(dimensions.y / 2 + padding.y);
    const angle = Math.atan(direction.y / direction.x);
    const xpad = dimensions.x / 2 + padding.x;
    const distanceCoefficient = dimensions.x + spacing;

    console.log(`line: ${line} - ${remainingUnits}`);

    for (let i = 0; i < remainingUnits; i++) {
      const distance = distanceCoefficient * i + xpad;
      if (distance > maxDistance - xpad) break;

      const position = line.a.add(direction.multiplyScalar(distance).add(inset));
      arr.push(new Mesh(shapes[0]).setPosition(position).setRotation(-angle));
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
