import Line from "./line";
import { mod, PI, acos, min } from "./math";
import Vec2 from "./vec2";

/** Returns the convex hull of a given polygon. */
export const giftwrap = (polygon: Vec2[]) => {
  if (polygon.length < 3) return [...polygon];

  const points = [...polygon];
  const hull = [];

  let tmp = points[0];
  for (const p of points) if (p.x < tmp.x) tmp = p; // Find leftmost point
  hull[0] = tmp;

  let ult: Vec2, penult: Vec2, newEnd!: Vec2;
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

    const a = current.sub(prev).normalize();
    const b = next.sub(current).normalize();
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

const intersectLines = (start0: Vec2, dir0: Vec2, start1: Vec2, dir1: Vec2) => {
  const dd = dir0.x * dir1.y - dir0.y * dir1.x; // dd=0 => lines are parallel. we don't care as our lines are never parallel.
  const dx = start1.x - start0.x;
  const dy = start1.y - start0.y;
  const t = (dx * dir1.y - dy * dir1.x) / dd;
  return new Vec2(start0.x + t * dir0.x, start0.y + t * dir0.y);
};

export interface OMBB {
  points: [Vec2, Vec2, Vec2, Vec2];
  width: number;
  height: number;
  area: number;
  up: Vec2;
  right: Vec2;
  tl: Vec2;
  bl: Vec2;
  tr: Vec2;
  br: Vec2;
}

/** Computes the Oriented Minimum Bounding Box (OMBB). */
export const computeOmbb = (convexHull: Vec2[]) => {
  let ombb!: OMBB;
  let bestArea = Number.MAX_VALUE;

  const count = convexHull.length;
  const edgeDirections = convexHull.map((_, i) => convexHull[(i + 1) % count].sub(convexHull[i]).normalize());

  // compute extreme points
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let leftIndex = -1;
  let rightIndex = -1;
  let topIndex = -1;
  let bottomIndex = -1;

  for (let i = 0; i < count; i++) {
    const [x, y] = convexHull[i];

    if (x < minX) {
      minX = x;
      leftIndex = i;
    }

    if (x > maxX) {
      maxX = x;
      rightIndex = i;
    }

    if (y < minY) {
      minY = y;
      bottomIndex = i;
    }

    if (y > maxY) {
      maxY = y;
      topIndex = i;
    }
  }

  // initial caliper lines + directions
  let left = new Vec2(0, -1);
  let right = new Vec2(0, 1);
  let top = new Vec2(-1, 0);
  let up = new Vec2(1, 0);

  // execute rotating caliper algorithm
  for (let i = 0; i < count; i++) {
    const phis = [
      acos(left.dot(edgeDirections[leftIndex])), // left
      acos(right.dot(edgeDirections[rightIndex])), // right
      acos(top.dot(edgeDirections[topIndex])), // top
      acos(up.dot(edgeDirections[bottomIndex])), // bottom
    ];

    const indexOfSmallestAngle = phis.indexOf(min(...phis));

    switch (indexOfSmallestAngle) {
      case 0: // left
        left = edgeDirections[leftIndex].clone();
        right = left.negate();
        top = left.orthogonal();
        up = top.negate();
        leftIndex = (leftIndex + 1) % count;
        break;
      case 1: // right
        right = edgeDirections[rightIndex].clone();
        left = right.negate();
        top = left.orthogonal();
        up = top.negate();
        rightIndex = (rightIndex + 1) % count;
        break;
      case 2: // top
        top = edgeDirections[topIndex].clone();
        up = top.negate();
        left = up.orthogonal();
        right = left.negate();
        topIndex = (topIndex + 1) % count;
        break;
      case 3: // bottom
        up = edgeDirections[bottomIndex].clone();
        top = up.negate();
        left = up.orthogonal();
        right = left.negate();
        bottomIndex = (bottomIndex + 1) % count;
        break;
    }

    const _ombb = createOmbb(
      convexHull[leftIndex],
      left,
      convexHull[rightIndex],
      right,
      convexHull[topIndex],
      top,
      convexHull[bottomIndex],
      up
    );

    if (_ombb.area < bestArea) {
      ombb = _ombb;
      bestArea = _ombb.area;
    }
  }

  return ombb;
};

const createOmbb = (
  leftStart: Vec2,
  left: Vec2,
  rightStart: Vec2,
  right: Vec2,
  topStart: Vec2,
  up: Vec2,
  bottomStart: Vec2,
  down: Vec2
): OMBB => {
  // corners
  const tl = intersectLines(leftStart, left, topStart, up);
  const tr = intersectLines(rightStart, right, topStart, up);
  const bl = intersectLines(bottomStart, down, leftStart, left);
  const br = intersectLines(bottomStart, down, rightStart, right);

  // dimensions and area
  const width = tl.distance(tr);
  const height = tl.distance(bl);
  const area = width * height;

  return {
    points: [tl, bl, br, tr],
    width,
    height,
    area,
    up,
    right,
    tl,
    bl,
    br,
    tr,
  };
};

const splitPolygon = (polygon: Vec2[], rayOrig: Vec2, rayDir: Vec2) => {
  if (!polygon || polygon.length < 3) throw new Error("input polygon must have at least 3 vertices");

  //sort inter points by distance from the ray origin

  return output;
};
