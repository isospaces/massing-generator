import GEO from "@flatten-js/core";
const { vector, point } = GEO;

export interface MeshOptions {
  name: string;
  strokeColor: string;
  fillColor: string;
  fill: boolean;
  position: GEO.Point;
  rotation: number;
}

export interface Mesh extends MeshOptions {
  poly: GEO.Polygon;
  toWorld(): GEO.Point[];
  translateVertex(index: number, value: GEO.Vector): void;
}

export const mesh = (poly: GEO.Polygon, options?: Partial<MeshOptions>): Mesh => ({
  ...{
    name: "Mesh",
    strokeColor: "#000",
    fillColor: "#888",
    fill: true,
    poly,
    position: point(),
    rotation: 0,
    toWorld() {
      return this.poly.vertices.map((p) => p.rotate(this.rotation).translate(vector(this.position.x, this.position.y)));
    },
    translateVertex(index: number, value: GEO.Vector) {
      this.poly.vertices[index] = this.poly.vertices[index].translate(value);
      return this;
    },
  },
  ...options,
});
