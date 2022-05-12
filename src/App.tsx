import { useEffect, useMemo, useRef, useState } from "react";
import { setupCanvas } from "./lib/utils";
import Vec2 from "./lib/vec2";
import { Mesh } from "./lib/mesh";
import { shapeToLines } from "./lib/collision";
import Shape from "./lib/shape";
import { generatePolygon, generateUnitPlacement } from "./lib/generation";
import "./App.css";

const DUMMY_CANVAS = document.createElement("canvas");

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(DUMMY_CANVAS);
  const { ctx, center, width, height } = useMemo(() => setupCanvas(canvasRef.current), [canvasRef.current]);
  const [unitCount, setUnitCount] = useState(5);
  const [plot] = useState(new Mesh(new Shape([])).setColor("#9c9"));
  const units = useRef<Mesh[]>([]);
  const [spacing, setSpacing] = useState(20);

  const generate = () => {
    // regenerate plot mesh
    plot.setShape(generatePolygon(5, 8, 0.2, 0.4).scale(width, height)).setPosition(center);

    // sort lines by how close the normal matches the south direction
    const lines = shapeToLines(plot.shapeWorld)
      .map((line, index) => {
        const { x, y } = line.relative().normalise();
        const normal = new Vec2(-y, x);
        return {
          index,
          line,
          normal,
        };
      })
      .sort((a, b) => a.normal.y - b.normal.y)
      .map((data) => data.line);

    units.current = generateUnitPlacement(unitCount, lines, spacing);
  };

  // Generation / Regeneration
  useEffect(() => generate(), [width, height, unitCount, spacing]);

  // render effect
  useEffect(() => {
    ctx.clearRect(0, 0, width, height);
    plot.render(ctx);
    units.current.forEach((unit) => unit.render(ctx));
  }, [unitCount, spacing]);

  useEffect(() => {
    const onclick = (e: MouseEvent) => {
      console.log(e.clientX, e.clientY);
    };

    canvasRef.current.addEventListener("click", onclick);

    return () => {
      canvasRef.current.removeEventListener("click", onclick);
    };
  }, [canvasRef.current]);

  return (
    <div>
      <canvas ref={canvasRef} />;
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
    <div className="controls">
      <div>
        <div>
          <p>Unit Count</p>
          <input type="range" min={1} max={20} step={1} defaultValue={5} onChange={onCountChange} />
        </div>
        <div>
          <p>Spacing</p>
          <input type="range" min={0} max={60} step={5} defaultValue={20} onChange={onSpacingChange} />
        </div>
      </div>
    </div>
  );
};

export default App;
