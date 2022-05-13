<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { setupCanvas, sortByNormals } from "./lib/utils";
import { Mesh } from "./lib/mesh";
import { shapeToLines } from "./lib/collision";
import Shape from "./lib/shape";
import { generatePolygon, generateUnitPlacement } from "./lib/generation";
import Scene from "./components/Scene.vue";

const scene = ref<typeof Scene>();
const plot = new Mesh(new Shape([])).setColor("#9c9");
const options = reactive({
  count: 10,
  spacing: 20,
});

let entities: Mesh[] = [];

const generate = () => {
  const data = scene.value;

  // const shape = generatePolygon(5, 8, 0.2, 0.4).scale(width, height);
  // plot.setShape(shape).setPosition(center);

  // const lines = sortByNormals(shapeToLines(plot.shapeWorld));
  // const units = generateUnitPlacement(lines, options);

  // entities = [plot, ...units];
};
</script>

<template>
  <Scene ref="scene" :entities="entities" background-color="#eee" />
  <div class="absolute bottom-4 left-4">
    <button @click="generate" class="shadow-md p-4 rounded-md bg-white">Generate</button>
  </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background: #ddd;
}
</style>
