import { useEffect, useMemo, useRef, useState } from "react";
import { SHAPES, setupCanvas, generatePolygon } from "./lib/utils";
import Random from "./lib/random";
import Vec2 from "./lib/vec2";
import { Mesh } from "./lib/mesh";
import "./App.css";
import { shapeToLines } from "./lib/collision";
import Shape from "./lib/shape";
import Line from "./lib/line";

const UNIT_1 = SHAPES.RECTANGLE.clone().scale(new Vec2(20, 60));
const UNIT_3 = SHAPES.RECTANGLE.clone().scale(new Vec2(60, 60));
const DUMMY_CANVAS = document.createElement("canvas");

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(DUMMY_CANVAS);
  const { ctx, center, width, height } = useMemo(() => setupCanvas(canvasRef.current), [canvasRef.current]);
  const [unitCount, setUnitCount] = useState(5);
  const [plot] = useState(new Mesh(new Shape([])).setColor("#9c9"));
  const units = useRef<Mesh[]>([]);
  const [spacing, setSpacing] = useState(20);

  const generateUnitPlacement = (count: number, lines: Line[]) => {
    const shapes = [UNIT_1, UNIT_3];
    const arr = [];

    const dimensions = new Vec2(40, 120);
    const padding = new Vec2(20, 20);

    let remainingUnits = count;
    for (const line of lines) {
      const maxDistance = line.distance();
      const direction = line.relative().normalise();
      const perpendicular = new Vec2(-direction.y, direction.x);
      const yOffset = perpendicular.multiplyScalar(dimensions.y / 2 + padding.y);
      const angle = Math.atan(direction.y / direction.x);
      const xpad = dimensions.x / 2 + padding.x;
      const distanceCoefficient = dimensions.x + spacing;

      for (let i = 0; i < remainingUnits; i++) {
        const distance = distanceCoefficient * i + xpad;
        if (distance > maxDistance) break;

        const offset = direction.multiplyScalar(distance);
        const position = line.a.add(offset).add(yOffset);
        const unit = new Mesh(shapes[0]).setPosition(position).setRotation(-angle);
        arr.push(unit);
      }

      if (remainingUnits === 0) return arr;
    }

    if (remainingUnits > 0) {
      console.warn(`${remainingUnits} units were unable to fit inside the plot`);
    }

    return arr;
  };

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

    units.current = generateUnitPlacement(unitCount, lines);
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
      <label>
        Unit Count
        <input type="range" min={1} max={20} step={1} defaultValue={5} onChange={onCountChange} />
      </label>
      <label>
        Spacing
        <input type="range" min={0} max={60} step={5} defaultValue={20} onChange={onSpacingChange} />
      </label>
    </div>
  );
};

export default App;
