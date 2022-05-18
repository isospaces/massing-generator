import Line from "./line";
import { mod, PI, acos } from "./math";
import Vec2 from "./vec2";

/** Returns the convex hull of a given polygon. */
export const giftwrap = (polygon: Vec2[]) => {
  if (polygon.length < 3) return [...polygon];

  const points = [...polygon];
  const hull = [];

  let tmp = points[0];
  for (const p of points) if (p.x < tmp.x) tmp = p; // Find leftmost point
  hull[0] = tmp;

  let ult: Vec2, penult: Vec2, newEnd: Vec2;
  let minAngle = Math.PI;

  ult = hull[0];
  penult = new Vec2(ult.x, ult.y + 10);

  do {
    minAngle = PI; // Initial value. Any angle must be lower that 2PI
    for (const p of points) {
      const angle = polarAngle(penult, ult, p);
      if (angle <= minAngle) {
        newEnd = p;
        minAngle = angle;
      }
    }

    if (newEnd != hull[0]) {
      hull.push(newEnd);
      penult = ult;
      ult = newEnd;
    }
  } while (newEnd != hull[0]);

  console.log("convex hull: ", hull);

  return hull;
};

/** Returns the angle between two segments (from three points) */
export const polarAngle = (a: Vec2, b: Vec2, c: Vec2) => {
  const x = (a.x - b.x) * (c.x - b.x) + (a.y - b.y) * (c.y - b.y);
  const y = (a.x - b.x) * (c.y - b.y) - (c.x - b.x) * (a.y - b.y);
  return Math.atan2(y, x);
};

export const simplify = (polygon: Vec2[], angularThreshold: number) => {
  const getPoint = (value: number) => polygon[mod(value, polygon.length)];
  return polygon.filter((_, i) => {
    const prev = getPoint(i - 1);
    const current = getPoint(i);
    const next = getPoint(i + 1);

    const a = current.sub(prev).normalise();
    const b = next.sub(current).normalise();
    const angle = acos(a.dot(b) / (a.magnitude() * b.magnitude()));

    return angle > angularThreshold;
  });
};

export const pointsToLines = (shape: Vec2[]) => {
  const lines = new Array<Line>();
  for (let i = 0; i < shape.length - 1; i++) {
    lines.push(new Line(shape[i], shape[i + 1]));
  }
  lines.push(new Line(shape[shape.length - 1], shape[0]));
  return lines;
};
