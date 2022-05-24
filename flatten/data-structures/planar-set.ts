import IntervalTree from "@flatten-js/interval-tree";
import { Shape } from "..";
import { Box } from "../classes/bbox";
import { Vector } from "../classes/vector";

/**
 * Class representing a planar set - a generic container with ability to keep and retrieve shapes and
 * perform spatial queries. Planar set is an extension of Set container, so it supports
 * Set properties and methods
 */
export class PlanarSet extends Set {
  index = new IntervalTree();

  /**
   * Create new instance of PlanarSet
   * Each object should have a <b>box</b> property
   */
  constructor(shapes: Shape[]) {
    super(shapes);
    this.forEach((shape) => this.index.insert(shape));
  }

  /**
   * Add new shape to planar set and to its spatial index.<br/>
   * If shape already exist, it will not be added again.
   * This happens with no error, it is possible to use <i>size</i> property to check if
   * a shape was actually added.<br/>
   * Method returns planar set object updated and may be chained
   */
  add(shape: Shape) {
    let size = this.size;
    super.add(shape);
    // size not changed - item not added, probably trying to add same item twice
    if (this.size > size) {
      let node = this.index.insert(shape.box, shape);
    }
    return this; // in accordance to Set.add interface
  }

  /** Delete shape from planar set. Returns true if shape was actually deleted, false otherwise */
  delete(shape: Shape) {
    const deleted = super.delete(shape);
    if (deleted) {
      this.index.remove(shape.box, shape);
    }
    return deleted;
  }

  /** Clear planar set */
  clear() {
    super.clear();
    this.index = new IntervalTree();
  }

  /**
   * 2d range search in planar set.<br/>
   * Returns array of all shapes in planar set which bounding box is intersected with query box
   */
  search(box: Box) {
    return this.index.search(box);
  }

  /** Point location test. Returns array of shapes which contains given point */
  hit(point: Vector) {
    let box = new Box(point.x - 1, point.y - 1, point.x + 1, point.y + 1);
    let resp = this.index.search(box);
    return resp.filter((shape) => point.on(shape));
  }

  /** Returns svg string to draw all shapes in planar set */
  svg() {
    let svgcontent = [...this].reduce((acc, shape) => acc + shape.svg(), "");
    return svgcontent;
  }
}
