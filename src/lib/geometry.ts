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

/** Computes the Oriented Minimum Bounding Box (OMBB). */
export const ombb = (convexHull: Vec2[]) => {
  let ombb = new Array<Vec2>(4);
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
  let leftDir = new Vec2(0, -1);
  let rightDir = new Vec2(0, 1);
  let topDir = new Vec2(-1, 0);
  let bottomDir = new Vec2(1, 0);

  // execute rotating caliper algorithm
  for (let i = 0; i < count; i++) {
    const phis = [
      acos(leftDir.dot(edgeDirections[leftIndex])), // left
      acos(rightDir.dot(edgeDirections[rightIndex])), // right
      acos(topDir.dot(edgeDirections[topIndex])), // top
      acos(bottomDir.dot(edgeDirections[bottomIndex])), // bottom
    ];

    const smallestAngle = min(...phis);
    const lineWithSmallestAngle = phis.indexOf(smallestAngle);

    switch (lineWithSmallestAngle) {
      case 0: // left
        leftDir = edgeDirections[leftIndex].clone();
        rightDir = leftDir.negate();
        topDir = leftDir.orthogonal();
        bottomDir = topDir.negate();
        leftIndex = (leftIndex + 1) % count;
        break;
      case 1: // right
        rightDir = edgeDirections[rightIndex].clone();
        leftDir = rightDir.negate();
        topDir = leftDir.orthogonal();
        bottomDir = topDir.negate();
        rightIndex = (rightIndex + 1) % count;
        break;
      case 2: // top
        topDir = edgeDirections[topIndex].clone();
        bottomDir = topDir.negate();
        leftDir = bottomDir.orthogonal();
        rightDir = leftDir.negate();
        topIndex = (topIndex + 1) % count;
        break;
      case 3: // bottom
        bottomDir = edgeDirections[bottomIndex].clone();
        topDir = bottomDir.negate();
        leftDir = bottomDir.orthogonal();
        rightDir = leftDir.negate();
        bottomIndex = (bottomIndex + 1) % count;
        break;
    }

    const bbox = calculateBoundingBox(
      convexHull[leftIndex],
      leftDir,
      convexHull[rightIndex],
      rightDir,
      convexHull[topIndex],
      topDir,
      convexHull[bottomIndex],
      bottomDir
    );

    if (bbox.area < bestArea) {
      ombb = bbox.box;
      bestArea = bbox.area;
    }
  }

  return { points: ombb, area: bestArea };
};

const calculateBoundingBox = (
  leftStart: Vec2,
  leftDir: Vec2,
  rightStart: Vec2,
  rightDir: Vec2,
  topStart: Vec2,
  topDir: Vec2,
  bottomStart: Vec2,
  bottomDir: Vec2
) => {
  // corners
  const tl = intersectLines(leftStart, leftDir, topStart, topDir);
  const tr = intersectLines(rightStart, rightDir, topStart, topDir);
  const bl = intersectLines(bottomStart, bottomDir, leftStart, leftDir);
  const br = intersectLines(bottomStart, bottomDir, rightStart, rightDir);

  // dimensions and area
  const width = tl.distance(tr);
  const height = tl.distance(bl);
  const area = width * height;

  return {
    box: [tl, bl, br, tr],
    area,
  };
};
