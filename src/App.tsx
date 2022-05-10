import { useEffect, useRef } from "react";
import "./App.css";
import { Point, Shape, intersectsShape } from "./utils";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const center: Point = [canvas.width / 2, canvas.height / 2];

    // setup canvas size and dpr
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const rectangle: Point[] = [
      [-50, -50],
      [-50, 50],
      [50, 50],
      [50, -50],
    ];

    // change to complex shape
    const randomShape: Point[] = [
      [-50, -50],
      [-50, 50],
      [50, 50],
      [50, -50],
    ];

    const shapeA = new Shape(rectangle, [...center]);
    const shapeB = new Shape(randomShape, [...center]);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const colliding = intersectsShape(shapeA.world, shapeB.world);
      ctx.strokeStyle = colliding ? "#f00" : "#0f0";
      ctx.fillStyle = colliding ? "#ff000066" : "#00ff0066";
      shapeA.render(ctx);
      ctx.strokeStyle = "#000";
      ctx.fillStyle = "#00000066";
      shapeB.render(ctx);
    };

    render();

    const keydown = (e: KeyboardEvent) => {
      const speed = 5;

      switch (e.code) {
        case "ArrowRight":
          shapeA.position[0] += speed;
          e.preventDefault();
          render();
          break;
        case "ArrowLeft":
          shapeA.position[0] -= speed;
          e.preventDefault();
          render();
          break;
        case "ArrowUp":
          shapeA.position[1] -= speed;
          e.preventDefault();
          render();
          break;
        case "ArrowDown":
          shapeA.position[1] += speed;
          e.preventDefault();
          render();
          break;
      }
    };

    window.addEventListener("keydown", keydown);

    return () => {
      window.removeEventListener("keydown", keydown);
    };
  });
  return <canvas ref={canvasRef} />;
}

export default App;
