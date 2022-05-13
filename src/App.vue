<script setup lang="ts">
import { ref } from "./vue";
import { setupCanvas, sortByNormals } from "./lib/utils";
import { Mesh } from "./lib/mesh";
import { shapeToLines } from "./lib/collision";
import Shape from "./lib/shape";
import { generatePolygon, generateUnitPlacement } from "./lib/generation";
import Vec2 from "./lib/vec2";

const canvas = ref();
const { ctx, center, width, height, dpr } = setupCanvas(canvas);
let unitCount = 10;
let spacing = 20;
const plot = new Mesh(new Shape([])).setColor("#9c9");
const units = new Array<Mesh>();
const offset = new Vec2(0, 0);

const generate = () => {
  const shape = generatePolygon(5, 8, 0.2, 0.4).scale(width, height);
  plot.current.setShape(shape).setPosition(center);

  const lines = sortByNormals(shapeToLines(plot.current.shapeWorld));
  units.current = generateUnitPlacement(lines, { count: unitCount, spacing });
};

const render = () => {
  // clear
  ctx.clearRect(0, 0, width, height);

  // translate
  const [offX, offY] = offset.current;
  ctx.resetTransform();
  ctx.translate(offX, offY);

  // render
  plot.current.render(ctx);
  units.current.forEach((unit) => unit.render(ctx));
};

const bindkeys = () => {
  const canvas = canvasRef.current;
  let pointerdown = false;

  const ondrag = (e: MouseEvent) => {
    if (!pointerdown) return;

    e.preventDefault();
    const movement = new Vec2(e.movementX, e.movementY);
    offset.current = offset.current.add(movement);
    forceUpdate();
  };

  const onpointerdown = () => {
    pointerdown = true;
    canvas.style.cursor = "grab";
  };

  const onpointerup = () => {
    pointerdown = false;
    canvas.style.cursor = "auto";
  };

  canvas.addEventListener("mousemove", ondrag);
  canvas.addEventListener("pointerdown", onpointerdown);
  canvas.addEventListener("pointerup", onpointerup);

  return () => {
    canvas.removeEventListener("mousemove", ondrag);
    canvas.removeEventListener("pointerdown", onpointerdown);
    canvas.removeEventListener("pointerup", onpointerup);
  };
};
</script>

<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
</template>
