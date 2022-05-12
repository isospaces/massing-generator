import { useReducer, useEffect, useMemo, useRef, useState } from "react";
import { setupCanvas, sortByNormals } from "./lib/utils";
import { Mesh } from "./lib/mesh";
import { shapeToLines } from "./lib/collision";
import Shape from "./lib/shape";
import { generatePolygon, generateUnitPlacement } from "./lib/generation";
import Vec2 from "./lib/vec2";

const DUMMY_CANVAS = document.createElement("canvas");

function App() {
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
  const canvasRef = useRef<HTMLCanvasElement>(DUMMY_CANVAS);
  const { ctx, center, width, height, dpr } = useMemo(() => setupCanvas(canvasRef.current), [canvasRef.current]);
  const [unitCount, setUnitCount] = useState(5);
  const [spacing, setSpacing] = useState(20);
  const plot = useRef(new Mesh(new Shape([])).setColor("#9c9"));
  const units = useRef<Mesh[]>([]);
  const offset = useRef(new Vec2(0, 0));

  const generate = () => {
    // regenerate plot mesh
    const shape = generatePolygon(5, 8, 0.2, 0.4).scale(width, height);
    plot.current.setShape(shape).setPosition(center);

    // sort lines by how close the normal matches the south direction
    const lines = sortByNormals(shapeToLines(plot.current.shapeWorld));
    units.current = generateUnitPlacement(lines, { count: unitCount, spacing });
  };

  // Generation / Regeneration
  useEffect(() => generate(), [width, height, unitCount, spacing]);

  // render effect
  useEffect(() => {
    // clear
    ctx.clearRect(0, 0, width, height);

    // translate
    const [offX, offY] = offset.current;
    ctx.resetTransform();
    ctx.translate(offX, offY);

    // render
    plot.current.render(ctx);
    units.current.forEach((unit) => unit.render(ctx));
  }, [unitCount, spacing, ignored]);

  useEffect(() => {
    const canvas = canvasRef.current;
    let pointerdown = false;

    const ondrag = (e: MouseEvent) => {
      if (!pointerdown) return;

      e.preventDefault();
      const movement = new Vec2(e.movementX, e.movementY);
      offset.current = offset.current.add(movement);
      forceUpdate();
    };

    const onpointerdown = () => {
      pointerdown = true;
      canvas.style.cursor = "grab";
    };

    const onpointerup = () => {
      pointerdown = false;
      canvas.style.cursor = "auto";
    };

    canvas.addEventListener("mousemove", ondrag);
    canvas.addEventListener("pointerdown", onpointerdown);
    canvas.addEventListener("pointerup", onpointerup);

    return () => {
      canvas.removeEventListener("mousemove", ondrag);
      canvas.removeEventListener("pointerdown", onpointerdown);
      canvas.removeEventListener("pointerup", onpointerup);
    };
  }, [canvasRef.current]);

  return (
    <div>
      <canvas ref={canvasRef} className="w-full" />
      <Controls
        onCountChange={(e) => setUnitCount(parseInt(e.target.value))}
        onSpacingChange={(e) => setSpacing(parseInt(e.target.value))}
      />
    </div>
  );
}

interface ControlProps {
  onCountChange: React.ChangeEventHandler<HTMLInputElement>;
  onSpacingChange: React.ChangeEventHandler<HTMLInputElement>;
}

const Controls = ({ onCountChange, onSpacingChange }: ControlProps) => {
  return (
    <div className=" absolute bottom-4 left-4">
      <div>
        <div>
          <p>Unit Count</p>
          <input type="range" min={1} max={20} step={1} defaultValue={5} onChange={onCountChange} />
        </div>
        <div>
          <p>Spacing</p>
          <input type="range" min={0} max={60} step={5} defaultValue={0} onChange={onSpacingChange} />
        </div>
      </div>
    </div>
  );
};

export default App;
