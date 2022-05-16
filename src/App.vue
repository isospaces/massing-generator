<script setup lang="ts">
import { transform } from "@vue/compiler-core";
import { defineComponent, onMounted, reactive, ref, watch, watchEffect } from "vue";
import useDrag from "./composables/useDrag";
import { shapeToLines } from "./lib/collision";
import { generatePolygon, generateUnitPlacement } from "./lib/generation";
import { mod } from "./lib/math";
import { Mesh } from "./lib/mesh";
import Renderer from "./lib/renderer";
import Shape from "./lib/shape";
import { sortByNormals } from "./lib/utils";
import Vec2 from "./lib/vec2";

let renderer: Renderer;
let offset = new Vec2(0, 0);

let units: Mesh[] = [];
const plot = new Mesh(new Shape([])).setColor("#9c9");
const options = reactive({
  count: 10,
  spacing: 20,
  enableGrid: true,
});

const render = () => renderer.render([plot, ...units], offset);

const generate = () => {
  if (!renderer) return;

  const shape = generatePolygon(5, 8, 20, 40);
  plot.setShape(shape);

  const lines = sortByNormals(shapeToLines(plot.shapeWorld));
  units = generateUnitPlacement(lines, options);

  render();
};

onMounted(() => {
  const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvasElement) return;

  renderer = new Renderer(canvasElement);
  generate();
});

useDrag(window as any, (e) => {
  offset = offset.add(new Vec2(e.movementX, e.movementY));
  render();
});

window.onscroll = (e) => {
  if (!renderer) return;
  console.log("scrolling");

  e.preventDefault();
  renderer.pixelsPerMetre = window.scrollY;
  render();
};
</script>

<template>
  <canvas id="canvas" class="w-screen h-screen" />
  <div class="absolute bottom-6 left-6 flex flex-col gap-4">
    <button
      @click="
        options.enableGrid = !options.enableGrid;
        render();
      "
      class="bg-white rounded-md p-2 hover:cursor-pointer hover:bg-neutral-100"
    >
      Toggle Grid
    </button>
    <div class="flex flex-col">
      <label for="count" class="uppercase text-xs mb-2">Count: {{ options.count }}</label>
      <input id="count" type="range" min="1" max="20" step="1" v-model="options.count" />
    </div>
    <div class="flex flex-col">
      <label for="spacing" class="uppercase text-xs mb-2">Spacing: {{ options.spacing }}</label>
      <input id="spacing" type="range" min="0" max="40" step="1" v-model="options.spacing" />
    </div>
    <button
      @click="generate"
      class="shadow-lg p-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white transition-colors hover:cursor-pointer font-bold text-lg"
    >
      Generate
    </button>
  </div>
  <div
    class="absolute bottom-6 right-6 w-40 h-40 rounded-full border-black bg-[#ffffff66] flex justify-center items-center font-bold"
  >
    <p class="absolute top-3 text-blue-500">N</p>
    <p class="absolute bottom-3 text-red-500">S</p>
    <p class="absolute right-3 opacity-25">E</p>
    <p class="absolute left-3 opacity-25">W</p>
  </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background: radial-gradient(#ddd, #ccc);
  overflow: hidden;
}
</style>
