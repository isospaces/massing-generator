import { onMounted, ref, Ref, watch } from "vue";
import Vec2 from "../lib/vec2";

interface CanvasData {
  ctx: CanvasRenderingContext2D;
  dimensions: Vec2;
  center: Vec2;
}

const useCanvas = (canvas: Ref<HTMLCanvasElement | undefined>) => {
  const ctx = ref<CanvasRenderingContext2D>();
  const dimensions = ref(new Vec2(0, 0));
  const center = ref(new Vec2(0, 0));

  watch(canvas, () => {
    if (!canvas.value) return;

    console.log("initialising canvas: ", canvas.value);

    ctx.value = canvas.value.getContext("2d")!;

    // setup canvas size and dpr
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.value.getBoundingClientRect();
    canvas.value.width = rect.width * dpr;
    canvas.value.height = rect.height * dpr;
    ctx.value.scale(dpr, dpr);

    // sizing
    const { width, height } = canvas.value;
    dimensions.value = new Vec2(width, height);
    center.value = new Vec2(width, height).divideScalar(2);

    // antialising
    ctx.value.imageSmoothingEnabled = true;
    ctx.value.imageSmoothingQuality = "high";

    // line style
    ctx.value.lineCap = "round";
    ctx.value.lineWidth = 1;
  });

  return { ctx, dimensions, center };
};

export default useCanvas;
