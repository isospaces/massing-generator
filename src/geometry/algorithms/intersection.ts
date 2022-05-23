import { Shape } from "..";
import { Box } from "../classes/box";
import { Line } from "../classes/line";
import { Segment } from "../classes/segment";
import { Vector } from "../classes/vector";
import { EQ, EQ_0, GT, LT } from "../utils/utils";

namespace Intersection {
  export namespace Line {
    export function toLine(a: Line, b: Line) {
      let intersections = [];

      let [A1, B1, C1] = a.standard;
      let [A2, B2, C2] = b.standard;

      /* Cramer's rule */
      let det = A1 * B2 - B1 * A2;
      let detX = C1 * B2 - B1 * C2;
      let detY = A1 * C2 - C1 * A2;

      if (!EQ_0(det)) {
        let x, y;

        if (B1 === 0) {
          // vertical line x  = C1/A1, where A1 == +1 or -1
          x = C1 / A1;
          y = detY / det;
        } else if (B2 === 0) {
          // vertical line x = C2/A2, where A2 = +1 or -1
          x = C2 / A2;
          y = detY / det;
        } else if (A1 === 0) {
          // horizontal line y = C1/B1, where B1 = +1 or -1
          x = detX / det;
          y = C1 / B1;
        } else if (A2 === 0) {
          // horizontal line y = C2/B2, where B2 = +1 or -1
          x = detX / det;
          y = C2 / B2;
        } else {
          x = detX / det;
          y = detY / det;
        }

        intersections.push(new Vector(x, y));
      }

      return intersections;
    }

    export const toCircle = (line: Line, circle: Circle) => {
      let ip = [];
      let prj = circle.pc.projectionOn(line); // projection of circle center on line
      let dist = circle.pc.distanceTo(prj)[0]; // distance from circle center to projection

      if (EQ(dist, circle.r)) {
        // line tangent to circle - return single intersection point
        ip.push(prj);
      } else if (LT(dist, circle.r)) {
        // return two intersection points
        let delta = Math.sqrt(circle.r * circle.r - dist * dist);
        let v_trans, pt;

        v_trans = line.norm.rotate90CCW().multiply(delta);
        pt = prj.translate(v_trans);
        ip.push(pt);

        v_trans = line.norm.rotate90CW().multiply(delta);
        pt = prj.translate(v_trans);
        ip.push(pt);
      }
      return ip;
    };

    export const toBox = (line: Line, box: Box) => {
      let intersections = [];
      for (let seg of box.toSegments()) {
        let intersections_tmp = segment2Line(seg, line);
        for (let pt of intersections_tmp) {
          if (!pointInIntersections(pt, intersections)) {
            intersections.push(pt);
          }
        }
      }
      return intersections;
    };

    export const toArc = (line: Line, arc: Arc) => {
      let intersections: Vector[] = [];

      if (toBox(line, arc.box).length === 0) {
        return intersections;
      }

      let circle = new Circle(arc.pc, arc.r);
      let ip_tmp = toCircle(line, circle);
      for (let pt of ip_tmp) {
        if (pt.on(arc)) {
          intersections.push(pt);
        }
      }

      return intersections;
    };
  }
}

export function segment2Line(seg: Segment, line: Line) {
  let ip = [];

  // Boundary cases
  if (seg.ps.on(line)) {
    ip.push(seg.ps);
  }
  // If both ends lay on line, return two intersection points
  if (seg.pe.on(line) && !seg.isZeroLength()) {
    ip.push(seg.pe);
  }

  if (ip.length > 0) {
    return ip; // done, intersection found
  }

  // If zero-length segment and nothing found, return no intersections
  if (seg.isZeroLength()) {
    return ip;
  }

  // Not a boundary case, check if both points are on the same side and
  // hence there is no intersection
  if ((seg.ps.leftTo(line) && seg.pe.leftTo(line)) || (!seg.ps.leftTo(line) && !seg.pe.leftTo(line))) {
    return ip;
  }

  // Calculate intersection between lines
  let line1 = new Line(seg.ps, seg.pe);
  return line2Line(line1, line);
}

export function segment2Segment(a: Segment, b: Segment) {
  let intersections: Vector[] = [];

  // quick reject
  if (a.box.not_intersect(b.box)) {
    return intersections;
  }

  // Special case of seg1 zero length
  if (a.isZeroLength()) {
    if (a.ps.on(b)) {
      intersections.push(a.ps);
    }
    return intersections;
  }

  // Special case of seg2 zero length
  if (b.isZeroLength()) {
    if (b.ps.on(a)) {
      intersections.push(b.ps);
    }
    return intersections;
  }

  // Neither seg1 nor seg2 is zero length
  let line1 = new Line(a.ps, a.pe);
  let line2 = new Line(b.ps, b.pe);

  // Check overlapping between segments in case of incidence
  // If segments touching, add one point. If overlapping, add two points
  if (line1.incidentTo(line2)) {
    if (a.ps.on(b)) {
      intersections.push(a.ps);
    }
    if (a.pe.on(b)) {
      intersections.push(a.pe);
    }
    if (b.ps.on(a) && !b.ps.equalTo(a.ps) && !b.ps.equalTo(a.pe)) {
      intersections.push(b.ps);
    }
    if (b.pe.on(a) && !b.pe.equalTo(a.ps) && !b.pe.equalTo(a.pe)) {
      intersections.push(b.pe);
    }
  } else {
    /* not incident - parallel or intersect */
    // Calculate intersection between lines
    let new_ip = line2Line(line1, line2);
    if (new_ip.length > 0 && new_ip[0].on(a) && new_ip[0].on(b)) {
      intersections.push(new_ip[0]);
    }

    // Fix missing intersection
    // const tol = 10*DP_TOL;
    // if (ip.length === 0 && new_ip.length > 0 && (new_ip[0].distanceTo(seg1)[0] < tol || new_ip[0].distanceTo(seg2)[0] < tol) ) {
    //     if (seg1.start.distanceTo(seg2)[0] < tol) {
    //         ip.push(new_ip[0]);
    //     }
    //     else if (seg1.end.distanceTo(seg2)[0] < tol) {
    //         ip.push(new_ip[0]);
    //     }
    //     else if (seg2.start.distanceTo(seg1)[0] < tol) {
    //         ip.push(new_ip[0]);
    //     }
    //     else if (seg2.end.distanceTo(seg1)[0] < tol) {
    //         ip.push(new_ip[0]);
    //     }
    // }
  }

  return intersections;
}

export function segment2Circle(segment: Segment, circle: Circle) {
  let intersections: Vector[] = [];

  if (segment.box.not_intersect(circle.box)) {
    return intersections;
  }

  // Special case of zero length segment
  if (segment.isZeroLength()) {
    let [dist, shortest_segment] = segment.start.distanceTo(circle.pc);
    if (EQ(dist, circle.r)) {
      intersections.push(segment.start);
    }
    return intersections;
  }

  // Non zero-length segment
  const line = new Line(segment.start, segment.end);
  return line2Circle(line, circle).filter((point) => point.on(segment));
}

export function segment2Arc(segment: Segment, arc: Arc) {
  let intersections: Vector[] = [];

  if (segment.box.not_intersect(arc.box)) {
    return intersections;
  }

  // Special case of zero-length segment
  if (segment.isZeroLength()) {
    return segment.start.on(arc) ? [segment.start] : [];
  }

  // Non-zero length segment
  let line = new Line(segment.ps, segment.pe);
  let circle = new Circle(arc.pc, arc.r);

  let ip_tmp = intersectLine2Circle(line, circle);

  for (let pt of ip_tmp) {
    if (pt.on(segment) && pt.on(arc)) {
      intersections.push(pt);
    }
  }
  return intersections;
}

export function intersectSegment2Box(segment: Segment, box: Box) {
  let intersections = [];
  for (let seg of box.toSegments()) {
    let intersections_tmp = segment2Segment(seg, segment);
    for (let ip of intersections_tmp) {
      intersections.push(ip);
    }
  }
  return intersections;
}

export function intersectCircle2Circle(circle1: Circle, circle2: Circle) {
  let intersections: Vector[] = [];

  if (circle1.box.not_intersect(circle2.box)) {
    return intersections;
  }

  let vec = new Vector(circle1.pc, circle2.pc);

  let r1 = circle1.r;
  let r2 = circle2.r;

  // Degenerated circle
  if (EQ_0(r1) || EQ_0(r2)) return intersections;

  // In case of equal circles return one leftmost point
  if (EQ_0(vec.x) && EQ_0(vec.y) && EQ(r1, r2)) {
    intersections.push(circle1.pc.translate(-r1, 0));
    return intersections;
  }

  let dist = circle1.pc.distanceTo(circle2.pc)[0];

  // circles too far, no intersections
  if (GT(dist, r1 + r2)) return intersections;

  // one circle is contained within another, no intersections
  if (LT(dist, Math.abs(r1 - r2))) return intersections;

  // Normalize vector.
  vec.x /= dist;
  vec.y /= dist;

  let pt;

  // Case of touching from outside or from inside - single intersection point
  // TODO: check this specifically not sure if correct
  if (EQ(dist, r1 + r2) || EQ(dist, Math.abs(r1 - r2))) {
    pt = circle1.pc.translate(r1 * vec.x, r1 * vec.y);
    intersections.push(pt);
    return intersections;
  }

  // Case of two intersection points

  // Distance from first center to center of common chord:
  //   a = (r1^2 - r2^2 + d^2) / 2d
  // Separate for better accuracy
  let a = (r1 * r1) / (2 * dist) - (r2 * r2) / (2 * dist) + dist / 2;

  let mid_pt = circle1.pc.translate(a * vec.x, a * vec.y);
  let h = Math.sqrt(r1 * r1 - a * a);
  // let norm;

  // norm = vec.rotate90CCW().multiply(h);
  pt = mid_pt.translate(vec.rotate90CCW().multiply(h));
  intersections.push(pt);

  // norm = vec.rotate90CW();
  pt = mid_pt.translate(vec.rotate90CW().multiply(h));
  intersections.push(pt);

  return intersections;
}

export function intersectCircle2Box(circle: Circle, box: Box) {
  const intersections: Vector[] = [];
  for (const seg of box.toSegments()) {
    let intersections_tmp = segment2Circle(seg, circle);
    for (const ip of intersections_tmp) {
      intersections.push(ip);
    }
  }
  return intersections;
}

export function intersectArc2Arc(a: Arc, b: Arc) {
  const intersections: Vector[] = [];

  if (a.box.not_intersect(b.box)) return intersections;

  // Special case: overlapping arcs
  // May return up to 4 intersection points
  if (a.pc.equalTo(b.pc) && EQ(a.r, b.r)) {
    let pt;

    pt = a.start;
    if (pt.on(b)) intersections.push(pt);

    pt = a.end;
    if (pt.on(b)) intersections.push(pt);

    pt = b.start;
    if (pt.on(a)) intersections.push(pt);

    pt = b.end;
    if (pt.on(a)) intersections.push(pt);

    return intersections;
  }

  // Common case
  let circle1 = new Circle(a.pc, a.r);
  let circle2 = new Circle(b.pc, b.r);
  let ip_tmp = circle1.intersect(circle2);
  for (let pt of ip_tmp) {
    if (pt.on(a) && pt.on(b)) {
      intersections.push(pt);
    }
  }
  return intersections;
}

export function intersectArc2Circle(arc, circle) {
  let ip = [];

  if (arc.box.not_intersect(circle.box)) {
    return ip;
  }

  // Case when arc center incident to circle center
  // Return arc's end points as 2 intersection points
  if (circle.pc.equalTo(arc.pc) && Utils.EQ(circle.r, arc.r)) {
    ip.push(arc.start);
    ip.push(arc.end);
    return ip;
  }

  // Common case
  let circle1 = circle;
  let circle2 = new Circle(arc.pc, arc.r);
  let ip_tmp = intersectCircle2Circle(circle1, circle2);
  for (let pt of ip_tmp) {
    if (pt.on(arc)) {
      ip.push(pt);
    }
  }
  return ip;
}

export function intersectArc2Box(arc, box) {
  let intersections = [];
  for (let seg of box.toSegments()) {
    let intersections_tmp = segment2Arc(seg, arc);
    for (let ip of intersections_tmp) {
      intersections.push(ip);
    }
  }
  return intersections;
}

export function intersectEdge2Segment(edge, segment) {
  return edge.isSegment() ? segment2Segment(edge.shape, segment) : segment2Arc(segment, edge.shape);
}

export function intersectEdge2Arc(edge, arc) {
  return edge.isSegment() ? segment2Arc(edge.shape, arc) : intersectArc2Arc(edge.shape, arc);
}

export function intersectEdge2Line(edge, line) {
  return edge.isSegment() ? segment2Line(edge.shape, line) : line2Arc(line, edge.shape);
}

export function intersectEdge2Circle(edge, circle) {
  return edge.isSegment() ? segment2Circle(edge.shape, circle) : intersectArc2Circle(edge.shape, circle);
}

export function intersectSegment2Polygon(segment, polygon) {
  let ip = [];

  for (let edge of polygon.edges) {
    for (let pt of intersectEdge2Segment(edge, segment)) {
      ip.push(pt);
    }
  }

  return ip;
}

export function intersectArc2Polygon(arc, polygon) {
  let ip = [];

  for (let edge of polygon.edges) {
    for (let pt of intersectEdge2Arc(edge, arc)) {
      ip.push(pt);
    }
  }

  return ip;
}

export function intersectLine2Polygon(line, polygon) {
  let ip = [];

  if (polygon.isEmpty()) {
    return ip;
  }

  for (let edge of polygon.edges) {
    for (let pt of intersectEdge2Line(edge, line)) {
      if (!pointInIntersections(pt, ip)) {
        ip.push(pt);
      }
    }
  }

  return line.sortPoints(ip);
}

export function intersectCircle2Polygon(circle, polygon) {
  let ip = [];

  if (polygon.isEmpty()) {
    return ip;
  }

  for (let edge of polygon.edges) {
    for (let pt of intersectEdge2Circle(edge, circle)) {
      ip.push(pt);
    }
  }

  return ip;
}

namespace Intersection {
  export namespace Edge {
    export const toEdge = (a: Edge, b: Edge) => {
      const shapeA = a.shape;
      const shapeB = b.shape;
      return a.isSegment()
        ? b.isSegment()
          ? segment2Segment(shapeA, shapeB)
          : segment2Arc(shapeA, shapeB)
        : b.isSegment()
        ? segment2Arc(shapeB, shapeA)
        : intersectArc2Arc(shapeA, shapeB);
    };

    export const toPolygon = (edge: Edge, polygon: Polygon) => {
      let intersections: Vector[] = [];

      if (polygon.isEmpty() || edge.shape.box.not_intersect(polygon.box)) {
        return intersections;
      }

      let resp_edges = polygon.edges.search(edge.shape.box);

      for (const resp_edge of resp_edges) {
        for (const point of toEdge(edge, resp_edge)) {
          intersections.push(point);
        }
      }

      return intersections;
    };
  }
}

export const intersectMultiline2Polygon = (multiline: MultiLine, polygon: Polygon) => {
  let intersections: Vector[] = [];

  if (polygon.isEmpty() || multiline.size === 0) {
    return intersections;
  }

  for (const edge of multiline) {
    const intersectionEdge = intersectEdge2Polygon(edge, polygon);
    const intersectionSorted = edge.shape.sortPoints(intersectionEdge); // TODO: support arc edge
    intersections = [...intersections, ...intersectionSorted];
  }

  return intersections;
};

export function intersectPolygon2Polygon(a: Polygon, b: Polygon) {
  const intersections: Vector[] = [];

  if (a.isEmpty() || b.isEmpty()) {
    return intersections;
  }

  if (a.box.not_intersect(b.box)) {
    return intersections;
  }

  for (const edge of a.edges) {
    for (const point of intersectEdge2Polygon(edge, b)) {
      intersections.push(point);
    }
  }

  return intersections;
}

export function intersectBox2Box(a: Box, b: Box) {
  const intersections = [];
  for (const aSegment of a.toSegments()) {
    for (const bSegment of b.toSegments()) {
      for (const point of segment2Segment(aSegment, bSegment)) {
        intersections.push(point);
      }
    }
  }
  return intersections;
}

export function intersectShape2Polygon(shape: Shape, polygon: Polygon) {
  if (shape instanceof Line) {
    return intersectLine2Polygon(shape, polygon);
  } else if (shape instanceof Segment) {
    return intersectSegment2Polygon(shape, polygon);
  } else if (shape instanceof Arc) {
    return intersectArc2Polygon(shape, polygon);
  } else {
    return [];
  }
}

const pointInIntersections = (newPoint: Vector, intersections: Vector[]) => {
  return intersections.some((point) => point.equalTo(newPoint));
};

export default Intersection;
