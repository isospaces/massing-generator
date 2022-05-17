import { assert, describe, expect, test } from "vitest";
import { shapeToLines } from "../src/lib/collision";
import { generatePolygon, generateUnitPlacement } from "../src/lib/generation";
import { Mesh } from "../src/lib/mesh";
import { sortByNormals } from "../src/lib/utils";

test("1000 generations benchmark", () => {
  for (let i = 0; i < 1000; i++) {
    const plot = new Mesh(generatePolygon(5, 8, 20, 40));
    const lines = sortByNormals(shapeToLines(plot.shapeWorld));
    // const units = generateUnitPlacement(lines, { count: 5 });
  }
});
