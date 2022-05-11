import { useEffect, useMemo, useRef, useState } from "react";
import { SHAPES, setupCanvas, shapeToLines, Line, intersects } from "./utils";
import Random from "./random";
import Vec2 from "./vec2";
import Shape from "./shape";
import Unit from "./unit";
import "./App.css";

const UNIT_1 = SHAPES.RECTANGLE.clone().multiply(new Vec2(20, 60));
const UNIT_3 = SHAPES.RECTANGLE.clone().multiply(new Vec2(60, 60));
const DUMMY_CANVAS = document.createElement("canvas");

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(DUMMY_CANVAS);
  const { ctx, center, width, height } = useMemo(() => setupCanvas(canvasRef.current), [canvasRef.current]);
  const [unitCount, setUnitCount] = useState(5);
  const [boundary, setBoundary] = useState<Shape>();

  const generate = (count: number) => {
    const shapes = [UNIT_1, UNIT_3];
    const arr = [];

    for (let i = 0; i < count; i++) {
      const shape = Random.select(shapes);
      const position = new Vec2(Random.range(0, width), Random.range(0, height));
      arr.push(new Unit(shape).setPosition(position));
    }

    return arr;
  };

  useEffect(() => {
    // create new boundary
    const _boundary = new Shape([
      new Vec2(0.25, 0.75),
      new Vec2(0.1, 0.4),
      new Vec2(0.25, 0.25),
      new Vec2(0.75, 0.25),
      new Vec2(0.85, 0.6),
      new Vec2(0.75, 0.75),
    ]).multiply(new Vec2(width, height));

    // process shape

    // const angles = lines
    //   .map((l, index) => {
    //     const x = Math.abs(l[1].x - l[0].x);
    //     const y = Math.abs(l[1].y - l[0].y);
    //     return { index, angle: x === 0 ? 0 : Math.atan(y / x) };
    //   })
    //   .sort((a, b) => Math.abs(a.angle) - Math.abs(b.angle))
    //   .map((line) => lines[line.index]);

    // resolution from nyquist of the smallest dx

    // find x and y bounds
    // let xStart = Infinity;
    // let xEnd = -Infinity;
    // let yStart = -Infinity;
    // let yEnd = Infinity;
    // for (const { x, y } of _boundary.points) {
    //   if (x < xStart) xStart = x;
    //   if (x > xEnd) xEnd = x;
    //   if (y > yStart) yStart = y;
    //   if (y < yEnd) yEnd = y;
    // }

    // find smallest dx in lines
    const lines = shapeToLines(_boundary.points)
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

    setBoundary(_boundary);
  }, [width, height]);

  useEffect(() => {
    ctx.clearRect(0, 0, width, height);

    // render boundary
    if (boundary) {
      const [first, ...rest] = boundary.points;
      ctx.strokeStyle = "#000";
      ctx.fillStyle = "#88cc88";
      ctx.beginPath();
      ctx.moveTo(first.x, first.y);
      for (const { x, y } of rest) {
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
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
  }, [unitCount, canvasRef.current, boundary]);

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
