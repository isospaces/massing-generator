<script setup lang="ts">
import { getCurrentInstance, onBeforeUpdate, onMounted, onUpdated, reactive, ref, watch } from "vue";
import useDrag from "../composables/useDrag";
import { Mesh } from "../lib/mesh";
import Vec2 from "../lib/vec2";

interface Props {
  backgroundColor?: string;
  entities: Mesh[];
}

// const props = withDefaults(defineProps<Props>(), {
//   backgroundColor: "#fff",
// });

// state
const canvas = document.createElement("canvas");
canvas.style.width = "100%";
canvas.style.height = "100%";

const ctx = canvas.getContext("2d")!;
const offset = ref(new Vec2(0, 0));
const dimensions = ref(new Vec2(0, 0));
const center = ref(new Vec2(0, 0));

const render = () => {
  if (!canvas) return;
  console.log("rendering");

  console.time("render");

  const { x: w, y: h } = dimensions.value;

  ctx.fillStyle = "#eee";
  ctx.clearRect(0, 0, w, h);
  ctx.fillRect(0, 0, w, h);

  const [offX, offY] = offset.value;
  ctx.resetTransform();
  ctx.translate(offX, offY);

  //   drawGrid(ctx, w, h);
  ctx.strokeStyle = "#ccc";
  const step = w / 20;

  for (let x = 0; x <= w; x += step) {
    for (let y = 0; y <= h; y += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  console.timeEnd("render");

  //   props.entities.forEach((e) => e.render(ctx));
};

// watch(offset, () => render());
onMounted(() => {
  const container = document.getElementById("container");
  if (!container) return;

  container.appendChild(canvas);
  console.log("initialising canvas: ", canvas);
  const ctx = canvas.getContext("2d")!;

  // setup canvas size and dpr
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  // sizing
  const { width, height } = canvas;
  dimensions.value = new Vec2(width, height);
  center.value = new Vec2(width, height).divideScalar(2);

  // antialising
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // line style
  ctx.lineCap = "round";
  ctx.lineWidth = 1;

  render();
});

canvas.onclick = () => {
  //   const { x, y } = offset.value;
  //   offset.value = new Vec2(x + 10, y + 10);
  //   console.log(offset.value);
  render();
};

// useDrag(canvas, (e) => {
//   e.preventDefault();
//   offset.value = offset.value.add(new Vec2(e.movementX, e.movementY));
// });
</script>

<template>
  <div id="container" class="w-screen h-screen" />
</template>
