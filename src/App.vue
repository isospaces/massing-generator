<script setup lang="ts">
import { onMounted, onUnmounted, reactive, Ref, ref } from "vue";
import { Vector } from "./geometry/classes/vector";
import { generateUnits, UnitGenerationOptions } from "./lib/generation";
import { abs, clamp, mod, PI, PI2 } from "./lib/math";
import { mesh, Mesh } from "./lib/mesh";
import Renderer, { PIXELS_PER_METRE } from "./lib/renderer";
import { throttle, time } from "./lib/utils";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const POLYGON = new Polygon([
  [74.5635488461703, 63.75],
  [68.49629332353302, 70.15608126530424],
  [59.72299125324935, 68.94712131272668],
  [-123.75, -14.541447076946497],
  [-125.81323577091098, -25.11067221271658],
  [-120.32687692700529, -34.12752078846096],
  [-55.889576808549464, -56.75],
  [-32.664069156261846, -60.60583237046376],
  [-14.61884133890273, -59.74877917704323],
  [18.249999999999996, -50.9018065109849],
  [47.99717836547641, -34.00696381242349],
  [60.159588124688696, -16.822156332433234],
]);

let renderer = ref<Renderer>();
let offset = new Vector(0, 0);
let zoom = 1;
let units: Mesh[] = [];
let hull: Mesh;
let activePoint: number | undefined;

const plot = ref(
  mesh(POLYGON, {
    name: "Plot",
    fillColor: "#F7F0D5",
  })
);

const options: UnitGenerationOptions = reactive({
  count: 50,
  spacing: 0,
  padding: new Vector(1, 6),
  angularThreshold: Math.PI / 16,
});

const render = () => renderer.value!.render([plot.value, ...units], offset, zoom);

const generate = throttle(() => {
  time("generation", () => {
    const poly = new Polygon(plot.value.toWorld());
    units = generateUnits(plot.value as Mesh, options);
    hull = mesh(poly, {
      strokeColor: "#0FF",
      fillColor: "#00ffff11",
    });
  });
  render();
}, 100);

const onKeyDown = (e: KeyboardEvent) => {
  if (e.code === "Space") generate();
};

const onMouseWheel = (e: any) => {
  zoom = clamp(zoom + e.deltaY / 250, MIN_ZOOM, MAX_ZOOM);
  render();
};

const onPointerDown = (e: PointerEvent) => {
  if (!renderer.value!.vertices) return;

  const position = new Vector(e.clientX, e.clientY);
  console.log("mouse: ", position);
  plot.value.toWorld().forEach(({ x, y }, i) => {
    const vertexPosition = new Vector(x, y).multiply(PIXELS_PER_METRE).add(renderer.value!.center);
    const distanceToPoint = position.subtract(vertexPosition).length;
    if (distanceToPoint < 5) activePoint = i;
  });

  render();
};

const onPointerUp = (e: PointerEvent) => {
  if (activePoint !== undefined) {
    activePoint = undefined;
    generate();
  }
};

const onPointerMove = (e: PointerEvent) => {
  if (activePoint === undefined) return;

  const delta = new Vector(e.movementX, e.movementY).multiply(1 / PIXELS_PER_METRE);
  plot.value.translateVertex(activePoint, delta);
  render();
};

onMounted(() => {
  const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvasElement) return;

  renderer.value = new Renderer(canvasElement);
  generate();

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointermove", onPointerMove);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("pointerdown", onPointerDown);
  window.removeEventListener("pointerup", onPointerUp);
  window.removeEventListener("pointermove", onPointerMove);
});
</script>

<template>
  <canvas id="canvas" class="w-screen h-screen" />
  <div class="absolute bottom-6 left-6 flex flex-col gap-4 accent-orange-500 select-none font-semibold">
    <!-- <p class="select-text max-w-sm">{{ plot.shape }}</p> -->
    <div v-if="renderer" class="flex justify-between items-center gap-2">
      <label>Padding</label>
      <input class="w-10 rounded pl-1" type="number" v-model="options.padding.x" @change="generate" />
      <input class="w-10 rounded pl-1" type="number" v-model="options.padding.y" @change="generate" />
    </div>
    <div v-if="renderer" class="flex justify-between items-center">
      <label for="annotations">Annotations</label>
      <input id="annotations" type="checkbox" v-model="renderer.annotations" @change="render" />
    </div>
    <div v-if="renderer" class="flex justify-between items-center">
      <label for="checkbox">Outlines</label>
      <input id="outlines" type="checkbox" v-model="renderer.outlines" @change="render" />
    </div>
    <div v-if="renderer" class="flex justify-between items-center">
      <label for="checkbox">Visible</label>
      <input id="outlines" type="checkbox" v-model="renderer.visible" @change="render" />
    </div>
    <div v-if="renderer" class="flex justify-between items-center">
      <label for="checkbox">Vertices</label>
      <input type="checkbox" id="checkbox" v-model="renderer.vertices" @change="render" />
    </div>
    <div class="flex flex-col">
      <label for="count" class="uppercase text-xs mb-2">Count: {{ options.count }}</label>
      <input id="count" type="range" min="1" max="100" step="1" v-model.number="options.count" @input="generate" />
    </div>
    <div class="flex flex-col">
      <label for="spacing" class="uppercase text-xs mb-2">Spacing: {{ options.spacing }}</label>
      <input id="spacing" type="range" min="0" max="10" step="1" v-model.number="options.spacing" @input="generate" />
    </div>
    <div class="flex flex-col">
      <label for="angle" class="uppercase text-xs mb-2"
        >Angle Limit: {{ options.angularThreshold.toPrecision(3) }} radians</label
      >
      <input
        id="angle"
        type="range"
        min="0"
        :max="PI / 8"
        :step="PI / 128"
        v-model.number="options.angularThreshold"
        @input="generate"
      />
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
  background-image: url("bg2.png");
  background-position: center;
  background-repeat: no-repeat;
  /* background: radial-gradient(#eee, #ccc); */
  overflow: hidden;
}
</style>
