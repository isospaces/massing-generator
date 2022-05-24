// import IntervalTree from "@flatten-js/interval-tree";
import { Shape } from "..";
import { sqrt } from "../../src/lib/math";
import { Arc } from "../classes/arc";
import { Box } from "../classes/bbox";
import { Line } from "../classes/line";
import { Segment } from "../classes/segment";
import { Vector } from "../classes/vector";
import { EQ_0, GE, GT, LE, LT } from "../utils/utils";
import Intersection from "./intersection";

export type DistanceAndShortestSegment = [number, Segment];

/** Calculate distance and shortest segment between points */
export const pointToPoint = (a: Vector, b: Vector): DistanceAndShortestSegment => a.distanceTo(b);

/** Calculate distance and shortest segment between point and line */
export const pointToLine = (point: Vector, line: Line): DistanceAndShortestSegment => {
  const closestPoint = point.projectionOn(line);
  const vec = new Vector(point, closestPoint);
  return [vec.length, new Segment(point, closestPoint)];
};

/** Calculate distance and shortest segment between point and circle */
export const pointToCircle = (point: Vector, circle: Circle): DistanceAndShortestSegment => {
  let [dist2center, shortest_dist] = point.distanceTo(circle.center);
  if (EQ_0(dist2center)) {
    return [circle.r, new Segment(point, circle.toArc().start)];
  } else {
    let dist = Math.abs(dist2center - circle.r);
    let v = new Vector(circle.pc, point).normalize().multiply(circle.r);
    let closest_point = circle.pc.translate(v);
    return [dist, new Segment(point, closest_point)];
  }
};

/** Calculate distance and shortest segment between point and segment */
export const pointToSegment = (point: Vector, segment: Segment) => {
  /* Degenerated case of zero-length segment */
  if (segment.start.equalTo(segment.end)) {
    return pointToPoint(point, segment.start);
  }

  const v_seg = new Vector(segment.start, segment.end);
  const v_ps2pt = new Vector(segment.start, point);
  const v_pe2pt = new Vector(segment.end, point);
  const start_sp = v_seg.dot(v_ps2pt);
  /* dot product v_seg * v_ps2pt */
  const end_sp = -v_seg.dot(v_pe2pt);
  /* minus dot product v_seg * v_pe2pt */

  let dist;
  let closestPoint;
  if (GE(start_sp, 0) && GE(end_sp, 0)) {
    /* point inside segment scope */
    const v_unit = segment.tangentInStart(); // new Vector(v_seg.x / this.length, v_seg.y / this.length);
    /* unit vector ||v_unit|| = 1 */
    dist = Math.abs(v_unit.cross(v_ps2pt));
    /* dist = abs(v_unit x v_ps2pt) */
    closestPoint = segment.start.add(v_unit.multiply(v_unit.dot(v_ps2pt)));
    return [dist, new Segment(point, closestPoint)];
  } else if (start_sp < 0) {
    /* point is out of scope closer to ps */
    return point.distanceTo(segment.start);
  } else {
    /* point is out of scope closer to pe */
    return point.distanceTo(segment.end);
  }
};

/** Calculate distance and shortest segment between point and arc */
export function pointToArc(point: Vector, arc: Arc): DistanceAndShortestSegment {
  let dist, shortest_segment;

  const circle = new Circle(arc.center, arc.radius);
  const outputs: DistanceAndShortestSegment[] = [];
  const circleDistance = pointToCircle(point, circle);

  [dist, shortest_segment] = circleDistance;

  if (shortest_segment.end.on(arc)) outputs.push(circleDistance);

  outputs.push(pointToPoint(point, arc.start), pointToPoint(point, arc.end));

  return sort(outputs)[0];
}

/** Calculate distance and shortest segment between point and polygon */
export const pointToPolygon = (point: Vector, polygon: Polygon) => {
  let min_dist_and_segment = [Number.POSITIVE_INFINITY, new Segment()];
  for (let edge of polygon.edges) {
    let [dist, shortest_segment] =
      edge.shape instanceof Segment ? pointToSegment(point, edge.shape) : pointToArc(point, edge.shape);
    if (LT(dist, min_dist_and_segment[0])) {
      min_dist_and_segment = [dist, shortest_segment];
    }
  }
  return min_dist_and_segment;
};

/** Calculate distance and shortest segment between segment and line */
export function segmentToLine(segment: Segment, line: Line) {
  let intersections = Intersection.segmentToLine(segment, line);
  if (intersections.length > 0) {
    return [0, new Segment(intersections[0], intersections[0])]; // distance = 0, closest point is the first point
  }
  let dist_and_segment = [];
  dist_and_segment.push(pointToLine(segment.start, line));
  dist_and_segment.push(pointToLine(segment.end, line));

  sort(dist_and_segment);
  return dist_and_segment[0];
}

/** Calculate distance and shortest segment between two segments */
export const segmentToSegment = (a: Segment, b: Segment): DistanceAndShortestSegment => {
  const intersections = Intersection.segment2Segment(a, b);
  if (intersections.length > 0) {
    return [0, new Segment(intersections[0], intersections[0])]; // distance = 0, closest point is the first point
  }

  // Seg1 and seg2 not intersected
  let dist_and_segment = [];
  let dist_tmp, shortest_segment_tmp;
  [dist_tmp, shortest_segment_tmp] = pointToSegment(b.start, a);
  dist_and_segment.push([dist_tmp, shortest_segment_tmp.reverse()]);
  [dist_tmp, shortest_segment_tmp] = pointToSegment(b.end, a);
  dist_and_segment.push([dist_tmp, shortest_segment_tmp.reverse()]);
  dist_and_segment.push(pointToSegment(a.start, b));
  dist_and_segment.push(pointToSegment(a.end, b));

  sort(dist_and_segment);
  return dist_and_segment[0];
};

/** Calculate distance and shortest segment between segment and circle */
export const segmentToCircle = (segment: Segment, circle: Circle): DistanceAndShortestSegment => {
  /* Case 1 Segment and circle intersected. Return the first point and zero distance */
  let intersections = segment.intersect(circle);
  if (intersections.length > 0) {
    return [0, new Segment(intersections[0], intersections[0])];
  }

  // No intersection between segment and circle

  /* Case 2. Distance to projection of center point to line bigger than radius
   * And projection point belong to segment
   * Then measure again distance from projection to circle and return it */
  let line = new Line(segment.start, segment.end);
  let [dist, shortest_segment] = pointToLine(circle.center, line);
  if (GE(dist, circle.r) && shortest_segment.end.on(segment)) {
    return pointToCircle(shortest_segment.end, circle);
  } else {
    /* Case 3. Otherwise closest point is one of the end points of the segment */
    let [dist_from_start, shortest_segment_from_start] = pointToCircle(segment.start, circle);
    let [dist_from_end, shortest_segment_from_end] = pointToCircle(segment.end, circle);
    return LT(dist_from_start, dist_from_end)
      ? [dist_from_start, shortest_segment_from_start]
      : [dist_from_end, shortest_segment_from_end];
  }
};

/** Calculate distance and shortest segment between segment and arc */
export function segment2arc(segment: Segment, arc: Arc) {
  /* Case 1 Segment and arc intersected. Return the first point and zero distance */
  let intersections = segment.intersect(arc);
  if (intersections.length > 0) {
    return [0, new Segment(intersections[0], intersections[0])];
  }

  // No intersection between segment and arc
  const line = new Line(segment.start, segment.end);
  const circle = new Circle(arc.center, arc.radius);

  /* Case 2. Distance to projection of center point to line bigger than radius AND
   * projection point belongs to segment AND
   * distance from projection point to circle belongs to arc  =>
   * return this distance from projection to circle */
  const [dist_from_center, shortest_segment_from_center] = pointToLine(circle.center, line);
  if (GE(dist_from_center, circle.r) && shortest_segment_from_center.end.on(segment)) {
    let [dist_from_projection, shortest_segment_from_projection] = pointToCircle(
      shortest_segment_from_center.end,
      circle
    );
    if (shortest_segment_from_projection.end.on(arc)) {
      return [dist_from_projection, shortest_segment_from_projection];
    }
  }
  /* Case 3. Otherwise closest point is one of the end points of the segment */
  const output = [pointToArc(segment.start, arc), pointToArc(segment.end, arc)];

  let dist_tmp, segment_tmp;
  [dist_tmp, segment_tmp] = pointToSegment(arc.start, segment);
  output.push([dist_tmp, segment_tmp.reverse()]);

  [dist_tmp, segment_tmp] = pointToSegment(arc.end, segment);
  output.push([dist_tmp, segment_tmp.reverse()]);

  return sort(output)[0];
}

/** Calculate distance and shortest segment between two circles */
export function circleToCircle(circleA: Circle, circleB: Circle) {
  let intersections = circleA.intersect(circleB);
  if (intersections.length > 0) {
    return [0, new Segment(intersections[0], intersections[0])];
  }

  if (circleA.center.equalTo(circleB.center)) {
    // CASE 1: Concentric circles. Convert to arcs and take distance between two arc starts
    const arcA = circleA.toArc();
    const arcB = circleB.toArc();
    return pointToPoint(arcA.start, arcB.start);
  } else {
    // CASE 2: Non-concentric circles
    const line = new Line(circleA.center, circleB.center);
    const ip1 = line.intersect(circleA);
    const ip2 = line.intersect(circleB);

    const output = [
      pointToPoint(ip1[0], ip2[0]),
      pointToPoint(ip1[0], ip2[1]),
      pointToPoint(ip1[1], ip2[1]),
      pointToPoint(ip1[1], ip2[0]),
    ];

    return sort(output)[0];
  }
}

/** Calculate distance and shortest segment between two circles */
export function circle2line(circle: Circle, line: Line) {
  const intersections = circle.intersect(line);
  if (intersections.length > 0) {
    return [0, new Segment(intersections[0], intersections[0])];
  }

  const [distanceFromCenter, shortestSegmentFromCenter] = pointToLine(circle.center, line);
  const [distance, shortest_segment] = pointToCircle(shortestSegmentFromCenter.end, circle);
  return [distance, shortest_segment.reverse()];
}

/** Calculate distance and shortest segment between arc and line */
export function arcToLine(arc: Arc, line: Line) {
  /* Case 1 Line and arc intersected. Return the first point and zero distance */
  const intersections = line.intersect(arc);
  if (intersections.length > 0) {
    return [0, new Segment(intersections[0], intersections[0])];
  }

  const circle = new Circle(arc.center, arc.radius);

  /* Case 2. Distance to projection of center point to line bigger than radius AND
   * projection point belongs to segment AND
   * distance from projection point to circle belongs to arc  =>
   * return this distance from projection to circle */
  const [dist_from_center, shortest_segment_from_center] = pointToLine(circle.center, line);
  if (GE(dist_from_center, circle.r)) {
    const [dist_from_projection, shortest_segment_from_projection] = pointToCircle(
      shortest_segment_from_center.end,
      circle
    );
    if (shortest_segment_from_projection.end.on(arc)) {
      return [dist_from_projection, shortest_segment_from_projection];
    }
  } else {
    return sort([pointToLine(arc.start, line), pointToLine(arc.end, line)])[0];
  }
}

/** Calculate distance and shortest segment between arc and circle */
export function arcToCircle(arc: Arc, circle: Circle) {
  const intersections = arc.intersect(circle);
  if (intersections.length > 0) {
    return [0, new Segment(intersections[0], intersections[0])];
  }

  const circle1 = new Circle(arc.center, arc.radius);
  const [distance, segment] = circleToCircle(circle1, circle);
  return segment.start.on(arc)
    ? [distance, segment]
    : sort([pointToCircle(arc.start, circle), pointToCircle(arc.end, circle)])[0];
}

/** Calculate distance and shortest segment between two arcs */
export function arc2arc(arcA: Arc, arcB: Arc) {
  let ip = arcA.intersect(arcB);
  if (ip.length > 0) {
    return [0, new Segment(ip[0], ip[0])];
  }

  let circle1 = new Circle(arcA.center, arcA.radius);
  let circle2 = new Circle(arcB.center, arcB.radius);

  let [distance, shortestSegment] = circleToCircle(circle1, circle2);
  if (shortestSegment.start.on(arcA) && shortestSegment.end.on(arcB)) {
    return [distance, shortestSegment];
  } else {
    let output: DistanceAndShortestSegment[] = [];

    let dist_tmp: number, segment_tmp: Segment;

    [dist_tmp, segment_tmp] = pointToArc(arcA.start, arcB);
    if (segment_tmp.end.on(arcB)) {
      output.push([dist_tmp, segment_tmp]);
    }

    [dist_tmp, segment_tmp] = pointToArc(arcA.end, arcB);
    if (segment_tmp.end.on(arcB)) {
      output.push([dist_tmp, segment_tmp]);
    }

    [dist_tmp, segment_tmp] = pointToArc(arcB.start, arcA);
    if (segment_tmp.end.on(arcA)) {
      output.push([dist_tmp, segment_tmp.reverse()]);
    }

    [dist_tmp, segment_tmp] = pointToArc(arcB.end, arcA);
    if (segment_tmp.end.on(arcA)) {
      output.push([dist_tmp, segment_tmp.reverse()]);
    }

    output.push(
      pointToPoint(arcA.start, arcB.start),
      pointToPoint(arcA.start, arcB.end),
      pointToPoint(arcA.end, arcB.start),
      pointToPoint(arcA.end, arcB.end)
    );

    return sort(output)[0];
  }
}

export function shape2polygon(shape: Shape, polygon: Polygon) {
  let minDistance = Infinity;
  let shortestSegment = undefined;
  for (let edge of polygon.edges) {
    let [dist, segment] = shape.distanceTo(edge.shape);
    if (LT(dist, minDistance)) {
      minDistance = dist;
      shortestSegment = segment;
    }
  }
  return [minDistance, shortestSegment];
}

/** Calculate distance and shortest segment between two polygons */
export function polygonToPolygon(polygonA: Polygon, polygonB: Polygon) {
  let minDistance = Infinity;
  let shortestSegment = undefined;
  for (let edge1 of polygonA.edges) {
    for (let edge2 of polygonB.edges) {
      const [dist, segment] = edge1.shape.distanceTo(edge2.shape);
      if (LT(dist, minDistance)) {
        minDistance = dist;
        shortestSegment = segment;
      }
    }
  }
  return [minDistance, shortestSegment];
}

/**
 * Returns [mindist, maxdist] array of squared minimal and maximal distance between boxes
 * Minimal distance by x is
 *    (box2.xmin - box1.xmax), if box1 is left to box2
 *    (box1.xmin - box2.xmax), if box2 is left to box1
 *    0,                       if box1 and box2 are intersected by x
 * Minimal distance by y is defined in the same way
 *
 * Maximal distance is estimated as a sum of squared dimensions of the merged box
 *
 */
export function boxToBoxMinMax(box1: Box, box2: Box) {
  const mindist_x = Math.max(Math.max(box1.xmin - box2.xmax, 0), Math.max(box2.xmin - box1.xmax, 0));
  const mindist_y = Math.max(Math.max(box1.ymin - box2.ymax, 0), Math.max(box2.ymin - box1.ymax, 0));
  const mindist = mindist_x * mindist_x + mindist_y * mindist_y;

  const box = box1.merge(box2);
  const dx = box.xmax - box.xmin;
  const dy = box.ymax - box.ymin;
  const maxdist = dx * dx + dy * dy;

  return [mindist, maxdist];
}

// export function minmax_tree_process_level(shape, level, min_stop, tree) {
//   // Calculate minmax distance to each shape in current level
//   // Insert result into the interval tree for further processing
//   // update min_stop with maxdist, it will be the new stop distance
//   let mindist, maxdist;
//   for (let node of level) {
//     // [mindist, maxdist] = box2box_minmax(shape.box, node.max);
//     // if (Utils.GT(mindist, min_stop))
//     //     continue;

//     // Estimate min-max dist to the shape stored in the node.item, using node.item.key which is shape's box
//     [mindist, maxdist] = box2box_minmax(shape.box, node.item.key);
//     if (node.item.value instanceof Edge) {
//       tree.insert([mindist, maxdist], node.item.value.shape);
//     } else {
//       tree.insert([mindist, maxdist], node.item.value);
//     }
//     if (LT(maxdist, min_stop)) {
//       min_stop = maxdist; // this will be the new distance estimation
//     }
//   }

//   if (level.length === 0) return min_stop;

//   // Calculate new level from left and right children of the current
//   let new_level_left = level
//     .map((node) => (node.left.isNil() ? undefined : node.left))
//     .filter((node) => node !== undefined);
//   let new_level_right = level
//     .map((node) => (node.right.isNil() ? undefined : node.right))
//     .filter((node) => node !== undefined);
//   // Merge left and right subtrees and leave only relevant subtrees
//   let new_level = [...new_level_left, ...new_level_right].filter((node) => {
//     // Node subtree quick reject, node.max is a subtree box
//     let [mindist, maxdist] = box2box_minmax(shape.box, node.max);
//     return LE(mindist, min_stop);
//   });

//   min_stop = minmax_tree_process_level(shape, new_level, min_stop, tree);
//   return min_stop;
// }

// /**
//  * Calculates sorted tree of [mindist, maxdist] intervals between query shape
//  * and shapes of the planar set.
//  */
// export function minmax_tree(shape, set, min_stop) {
//   let tree = new IntervalTree();
//   let level = [set.index.root];
//   let squared_min_stop = min_stop < Number.POSITIVE_INFINITY ? min_stop * min_stop : Number.POSITIVE_INFINITY;
//   squared_min_stop = minmax_tree_process_level(shape, level, squared_min_stop, tree);
//   return tree;
// }

// export const minmaxTreeCalulateDistance = (shape: Shape, node, data) => {
//   let min_dist_and_segment_new, stop;
//   if (node != null && !node.isNil()) {
//     [min_dist_and_segment_new, stop] = minmaxTreeCalulateDistance(shape, node.left, data);

//     if (stop) {
//       return [min_dist_and_segment_new, stop];
//     }

//     if (LT(min_dist_and_segment_new[0], sqrt(node.item.key.low))) {
//       return [min_dist_and_segment_new, true]; // stop condition
//     }

//     let [dist, shortest_segment] = distance(shape, node.item.value);
//     // console.log(dist)
//     if (LT(dist, min_dist_and_segment_new[0])) {
//       min_dist_and_segment_new = [dist, shortest_segment];
//     }

//     [min_dist_and_segment_new, stop] = minmaxTreeCalulateDistance(shape, node.right, min_dist_and_segment_new);

//     return [min_dist_and_segment_new, stop];
//   }

//   return [data, false];
// };

/** Calculates distance between shape and Planar Set of shapes */
// export function shapeToPlanarSet(shape: Shape, set: PlanarSet, minStop = Number.POSITIVE_INFINITY) {
//   let min_dist_and_segment = [minStop, new Segment()];
//   let stop = false;
//   if (set instanceof PlanarSet) {
//     let tree = minmax_tree(shape, set, minStop);
//     [min_dist_and_segment, stop] = minmaxTreeCalulateDistance(shape, tree.root, min_dist_and_segment);
//   }
//   return min_dist_and_segment;
// }

export const sort = (data: DistanceAndShortestSegment[]) =>
  data.sort((a, b) => {
    if (LT(a[0], b[0])) return -1;
    if (GT(a[0], b[0])) return 1;
    return 0;
  });

export const distance = (shapeA: Shape, shapeB: Shape) => {
  return shapeA.distanceTo(shapeB);
};
