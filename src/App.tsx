import { useEffect, useRef } from "react";
import "./App.css";
import { Vec2, Unit, intersectsShape, Shape, scaleShape, SHAPES, COLORS } from "./utils";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const center: Vec2 = [canvas.width / 2, canvas.height / 2];

    // setup canvas size and dpr
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const boundary = scaleShape(
      [
        [0.25, 0.75],
        [0.25, 0.25],
        [0.75, 0.25],
        [0.75, 0.75],
      ],
      [canvas.width, canvas.height]
    );

    const unitA = new Unit(scaleShape(SHAPES.RECTANGLE, [50, 50])).setPosition([...center]);
    const units = [new Unit(scaleShape(SHAPES.DIAMOND, [50, 50])).setPosition([...center])];

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const colliding = unitA.intersects(...units);
      unitA.color = colliding ? COLORS.RED : COLORS.GREEN;

      unitA.render(ctx);
      for (const u of units) {
        u.render(ctx);
      }
    };

    render();

    const keydown = (e: KeyboardEvent) => {
      const speed = 5;

      switch (e.code) {
        case "ArrowRight":
          unitA.translate([speed, 0]);
          e.preventDefault();
          render();
          break;
        case "ArrowLeft":
          unitA.translate([-speed, 0]);
          e.preventDefault();
          render();
          break;
        case "ArrowUp":
          unitA.translate([0, -speed]);
          e.preventDefault();
          render();
          break;
        case "ArrowDown":
          unitA.translate([0, speed]);
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
