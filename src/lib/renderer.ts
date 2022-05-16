import { mod } from "./math";
import { Mesh } from "./mesh";
import Vec2 from "./vec2";

export default class Renderer {
  public readonly ctx: CanvasRenderingContext2D;
  public readonly center: Vec2;
  public size: Vec2;
  public pixelsPerMetre = 10;
  public outlines = false;
  public vertices = false;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;

    // setup canvas size and dpr
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    this.size = new Vec2(rect.width * dpr, rect.height * dpr);
    canvas.width = this.size.x;
    canvas.height = this.size.y;
    this.ctx.scale(dpr, dpr);

    // sizing
    this.center = this.size.divideScalar(2);

    // antialising
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";

    // line style
    this.ctx.lineCap = "round";
    this.ctx.lineWidth = 1;
  }

  public render(scene: Mesh[], offset: Vec2, zoom = 1) {
    console.time("render");
    const [w, h] = this.size;
    const pixelScale = this.pixelsPerMetre * zoom;

    this.ctx.resetTransform();
    this.ctx.clearRect(0, 0, w, h);

    const translation = offset.add(this.center);
    this.renderGrid(translation, pixelScale);
    this.ctx.translate(translation.x, translation.y);

    scene.forEach((mesh) => this.renderMesh(mesh, pixelScale));
    console.timeEnd("render");
  }

  private renderMesh(mesh: Mesh, pixelScale: number) {
    const points = mesh.shapeWorld.map((point) => point.multiplyScalar(pixelScale));
    const [first, ...rest] = points;
    // color
    this.ctx.strokeStyle = "#000";
    this.ctx.fillStyle = mesh.color;

    // path
    this.ctx.beginPath();
    this.ctx.moveTo(first.x, first.y);
    rest.forEach(({ x, y }) => this.ctx.lineTo(x, y));
    this.ctx.closePath();
    this.ctx.fill();
    if (this.outlines) this.ctx.stroke();

    // draw vertices and origin
    if (this.vertices) {
      this.ctx.fillStyle = "#000";
      points.forEach((point) => this.renderVertex(point, 2));
    }
    // this.renderVertex(mesh.position.multiplyScalar(pixelScale), 5);
  }

  private renderVertex(position: Vec2, radius: number) {
    const [x, y] = position;
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, radius, radius, 0, 0, 360);
    this.ctx.fill();
  }

  private renderGrid = (offset: Vec2, pixelScale: number) => {
    const [dx, dy] = offset;
    const [w, h] = this.size;

    this.ctx.strokeStyle = "#bbb";
    this.ctx.beginPath();
    for (let p = 0; p <= w; p += pixelScale) {
      const x = mod(p + dx, w);
      const y = mod(p + dy, w);
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
    }
    this.ctx.stroke();
  };
}
