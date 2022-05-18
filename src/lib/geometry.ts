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

const intersectLines = (start0: Vec2, dir0: Vec2, start1: Vec2, dir1: Vec2) => {
  let dd = dir0.x * dir1.y - dir0.y * dir1.x;
  // dd=0 => lines are parallel. we don't care as our lines are never parallel.
  let dx = start1.x - start0.x;
  let dy = start1.y - start0.y;
  let t = (dx * dir1.y - dy * dir1.x) / dd;
  return new Vec2(start0.x + t * dir0.x, start0.y + t * dir0.y);
};

// computes the minimum area enclosing rectangle
// (aka oriented minimum bounding box)
export const ombb = (convexHull: Vec2[]) => {
  let ombb = new Array<Vec2>(4);
  let bestArea = Number.MAX_VALUE;

  // initialize attributes

  const count = convexHull.length;

  // compute directions of convex hull edges
  let edgeDirs = [];
  for (let i = 0; i < convexHull.length; i++) {
    edgeDirs.push(convexHull[(i + 1) % convexHull.length].sub(convexHull[i]));
    edgeDirs[i].normalise();
  }

  // compute extreme points
  const minPt = new Vec2(Infinity, Infinity);
  const maxPt = new Vec2(-Infinity, -Infinity);
  let leftIndex = -1;
  let rightIndex = -1;
  let topIndex = -1;
  let bottomIndex = -1;

  for (let i = 0; i < count; i++) {
    const pt = convexHull[i];

    if (pt.x < minPt.x) {
      minPt.x = pt.x;
      leftIndex = i;
    }

    if (pt.x > maxPt.x) {
      maxPt.x = pt.x;
      rightIndex = i;
    }

    if (pt.y < minPt.y) {
      minPt.y = pt.y;
      bottomIndex = i;
    }

    if (pt.y > maxPt.y) {
      maxPt.y = pt.y;
      topIndex = i;
    }
  }

  // initial caliper lines + directions
  //
  //        top
  //      <-------
  //      |      A
  //      |      | right
  // left |      |
  //      V      |
  //      ------->
  //       bottom
  let leftDir = new Vec2(0, -1);
  let rightDir = new Vec2(0, 1);
  let topDir = new Vec2(-1, 0);
  let bottomDir = new Vec2(1, 0);

  // execute rotating caliper algorithm
  for (let i = 0; i < count; i++) {
    const phis = [
      acos(leftDir.dot(edgeDirs[leftIndex])), // left
      acos(rightDir.dot(edgeDirs[rightIndex])), // right
      acos(topDir.dot(edgeDirs[topIndex])), // top
      acos(bottomDir.dot(edgeDirs[bottomIndex])), // bottom
    ];

    const lineWithSmallestAngle = phis.indexOf(min(...phis));
    switch (lineWithSmallestAngle) {
      case 0: // left
        leftDir = edgeDirs[leftIndex].clone();
        rightDir = leftDir.negate();
        topDir = leftDir.orthogonal();
        bottomDir = topDir.negate();
        leftIndex = (leftIndex + 1) % count;
        break;
      case 1: // right
        rightDir = edgeDirs[rightIndex].clone();
        leftDir = rightDir.negate();
        topDir = leftDir.orthogonal();
        bottomDir = topDir.negate();
        rightIndex = (rightIndex + 1) % count;
        break;
      case 2: // top
        topDir = edgeDirs[topIndex].clone();
        bottomDir = topDir.negate();
        leftDir = bottomDir.orthogonal();
        rightDir = leftDir.negate();
        topIndex = (topIndex + 1) % count;
        break;
      case 3: // bottom
        bottomDir = edgeDirs[bottomIndex].clone();
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
      ombb = bbox.ombb;
      bestArea = bbox.area;
    }
  }

  return ombb;
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
  const obbUpperLeft = intersectLines(leftStart, leftDir, topStart, topDir);
  const obbUpperRight = intersectLines(rightStart, rightDir, topStart, topDir);
  const obbBottomLeft = intersectLines(bottomStart, bottomDir, leftStart, leftDir);
  const obbBottomRight = intersectLines(bottomStart, bottomDir, rightStart, rightDir);
  const distLeftRight = obbUpperLeft.distance(obbUpperRight);
  const distTopBottom = obbUpperLeft.distance(obbBottomLeft);
  const area = distLeftRight * distTopBottom;

  return {
    ombb: [obbUpperLeft, obbBottomLeft, obbBottomRight, obbUpperRight],
    area,
  };
};
