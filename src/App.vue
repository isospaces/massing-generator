<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from "vue";
import useDrag from "./composables/useDrag";
import { shapeToLines } from "./lib/collision";
import { generatePolygon, generateUnitPlacement } from "./lib/generation";
import { clamp, mod } from "./lib/math";
import { Mesh } from "./lib/mesh";
import Renderer from "./lib/renderer";
import Shape from "./lib/shape";
import Vec2 from "./lib/vec2";
import { sortByNormals } from "./lib/utils";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;

let renderer = ref<Renderer>();
let offset = new Vec2(0, 0);
let zoom = 1;
let units: Mesh[] = [];
const plot = new Mesh(new Shape([])).setColor("#9c9");
const options = reactive({
  count: 10,
  spacing: 20,
});

const render = () => renderer.value!.render([plot, ...units], offset, zoom);

const generate = () => {
  if (!renderer) return;

  console.time("generation");
  const shape = generatePolygon(5, 8, 20, 40);
  plot.setShape(shape);

  units = generateUnitPlacement(plot, options);

  console.timeEnd("generation");
  render();
};

const onKeyDown = (e: KeyboardEvent) => {
  if (e.code === "Space") generate();
};

const onMouseWheel = (e: any) => {
  zoom = clamp(zoom + e.deltaY / 250, MIN_ZOOM, MAX_ZOOM);
  render();
};

onMounted(() => {
  const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvasElement) return;

  renderer.value = new Renderer(canvasElement);
  generate();

  // window.addEventListener("mousewheel", onMouseWheel);
  window.addEventListener("keydown", onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
  // window.removeEventListener("mousewheel", onMouseWheel);
});

useDrag("canvas", (e) => {
  offset = offset.add(new Vec2(e.movementX, e.movementY));
  render();
});
</script>

<template>
  <canvas id="canvas" class="w-screen h-screen" />
  <div class="absolute bottom-6 left-6 flex flex-col gap-4">
    <div v-if="renderer" class="flex justify-between items-center">
      <label for="checkbox">Outlines</label>
      <input type="checkbox" id="checkbox" v-model="renderer.outlines" @change="render" />
    </div>
    <div v-if="renderer" class="flex justify-between items-center">
      <label for="checkbox">Vertices</label>
      <input type="checkbox" id="checkbox" v-model="renderer.vertices" @change="render" />
    </div>
    <div class="flex flex-col">
      <label for="count" class="uppercase text-xs mb-2">Count: {{ options.count }}</label>
      <input id="count" type="range" min="1" max="20" step="1" v-model.number="options.count" @input="generate" />
    </div>
    <div class="flex flex-col">
      <label for="spacing" class="uppercase text-xs mb-2">Spacing: {{ options.spacing }}</label>
      <input id="spacing" type="range" min="0" max="10" step=".5" v-model.number="options.spacing" @input="generate" />
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
