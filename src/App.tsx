import { useEffect, useMemo, useRef, useState } from "react";
import { SHAPES, setupCanvas, generatePolygon } from "./lib/utils";
import Random from "./lib/random";
import Vec2 from "./lib/vec2";
import { Mesh } from "./lib/mesh";
import "./App.css";
import { shapeToLines } from "./lib/collision";

const UNIT_1 = SHAPES.RECTANGLE.clone().scale(new Vec2(20, 60));
const UNIT_3 = SHAPES.RECTANGLE.clone().scale(new Vec2(60, 60));
const DUMMY_CANVAS = document.createElement("canvas");

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(DUMMY_CANVAS);
  const { ctx, center, width, height } = useMemo(() => setupCanvas(canvasRef.current), [canvasRef.current]);
  const [unitCount, setUnitCount] = useState(5);
  const [plot, setPlot] = useState<Mesh>();

  const generate = (count: number) => {
    const shapes = [UNIT_1, UNIT_3];
    const arr = [];

    for (let i = 0; i < count; i++) {
      const shape = Random.select(shapes);
      const position = new Vec2(Random.range(0, width), Random.range(0, height));
      arr.push(new Mesh(shape).setPosition(position));
    }

    return arr;
  };

  useEffect(() => {
    // create new boundary

    const shape = generatePolygon(5, 10, 0.2, 0.4).scale(width, height);
    const plot = new Mesh(shape).setPosition(center).setColor("#9c9");
    setPlot(plot);

    // find smallest dx in lines
    const lines = shapeToLines(shape.points)
      .map((line, index) => {
        const { x, y } = Vec2.sub(line[0], line[1]).normalise();
        const normal = new Vec2(-y, x);
        return {
          index,
          normal,
        };
      })
      .sort((a, b) => a.normal.y - b.normal.y);

    console.log("lines sorted by south-facing preference: ", lines);
  }, [width, height, unitCount]);

  useEffect(() => {
    ctx.clearRect(0, 0, width, height);

    // render boundary
    if (plot) {
      plot.render(ctx);
    }

    // render primary unit
    // const colliding = primary.intersects(...units);
    // primary.color = colliding ? COLORS.RED : COLORS.GREEN;
    // primary.render(ctx);

    // render other units
    const units = generate(unitCount);
    console.log(units);

    for (const u of units) {
      u.render(ctx);
    }
  }, [unitCount, canvasRef.current, plot]);

  return (
    <div>
      <canvas ref={canvasRef} />;
      <Controls onCountChange={(e) => setUnitCount(parseInt(e.target.value))} />
    </div>
  );
}

interface ControlProps {
  onCountChange: React.ChangeEventHandler<HTMLInputElement>;
}

const Controls = ({ onCountChange }: ControlProps) => {
  return (
    <div className="controls">
      <input type="range" min={1} max={20} step={1} defaultValue={5} onChange={onCountChange} />
    </div>
  );
};

export default App;
