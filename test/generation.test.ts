import { assert, describe, expect, test } from "vitest";
import { generatePolygon } from "../src/lib/generation";
import { pointsToLines } from "../src/lib/geometry";

// test("1000 generations benchmark", () => {
//   for (let i = 0; i < 1000; i++) {
//     const plot = mesh(generatePolygon(5, 8, 20, 40));
//     const lines = sortByNormals(pointsToLines(plot.shapeWorld));
//     // const units = generateUnitPlacement(lines, { count: 5 });
//   }
// });
