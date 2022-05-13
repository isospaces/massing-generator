<script setup lang="ts">
import { onBeforeUpdate, onMounted, reactive, ref, watch } from "vue";
import useCanvas from "../composables/useCanvas";
import { Mesh } from "../lib/mesh";
import { drawGrid } from "../lib/utils";
import Vec2 from "../lib/vec2";

interface Props {
  backgroundColor?: string;
  entities: Mesh[];
}

const props = withDefaults(defineProps<Props>(), {
  backgroundColor: "#fff",
});

// state
const canvas = ref<HTMLCanvasElement>();
const { ctx: context, dimensions } = useCanvas(canvas);
let pointerdown = false;
const offset = ref(new Vec2(0, 0));

const render = () => {
  if (!context.value) return;
  const ctx = context.value;
  const { x: w, y: h } = dimensions.value;

  ctx.fillStyle = props.backgroundColor;
  ctx.fillRect(0, 0, w, h);

  const [offX, offY] = offset.value;
  ctx.resetTransform();
  ctx.translate(offX, offY);

  drawGrid(ctx, w, h);

  props.entities.forEach((e) => e.render(ctx));
};

watch(offset, () => render());

// event handlers
const onmousemove = (e: MouseEvent) => {
  if (!pointerdown) return;
  e.preventDefault();
  offset.value = offset.value.add(new Vec2(e.movementX, e.movementY));
};

const onpointerdown = (e: PointerEvent) => {
  pointerdown = true;
  (e.target as HTMLCanvasElement).style.cursor = "grab";
};

const onpointerup = (e: PointerEvent) => {
  pointerdown = false;
  (e.target as HTMLCanvasElement).style.cursor = "auto";
};
</script>

<template>
  <canvas
    ref="canvas"
    @pointerup="onpointerup"
    @pointerdown="onpointerdown"
    class="w-screen h-screen"
    @mousemove="onmousemove"
  />
</template>
