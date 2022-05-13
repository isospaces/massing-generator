import { onMounted, onUnmounted, Ref } from "vue";

const useDrag = (target: HTMLElement, onDrag: (e: PointerEvent) => void) => {
  let pointerdown = false;

  const onPointerMove = (e: PointerEvent) => {
    if (pointerdown) onDrag(e);
  };

  const onPointerDown = (e: PointerEvent) => {
    pointerdown = true;
    (e.target as HTMLCanvasElement).style.cursor = "grab";
  };

  const onPointerUp = (e: PointerEvent) => {
    pointerdown = false;
    (e.target as HTMLCanvasElement).style.cursor = "auto";
  };

  onMounted(() => {
    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerup", onPointerUp);
    target.addEventListener("pointerdown", onPointerDown);
  });

  onUnmounted(() => {
    target.removeEventListener("pointermove", onPointerMove);
    target.removeEventListener("pointerup", onPointerUp);
    target.removeEventListener("pointerdown", onPointerDown);
  });
};

export default useDrag;
