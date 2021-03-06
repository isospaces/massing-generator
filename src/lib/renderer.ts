import { mod } from "./math";
import { Mesh } from "./mesh";
import Vector from "./vector";

export const PIXELS_PER_METRE = 4;

export default class Renderer {
  public readonly ctx: CanvasRenderingContext2D;
  public readonly center: Vector;
  public size: Vector;
  public outlines = true;
  public annotations = false;
  public vertices = false;
  public grid = false;
  public visible = true;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;

    // setup canvas size and dpr
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    this.size = new Vector(rect.width * dpr, rect.height * dpr);
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

  public render(scene: Mesh[], offset: Vector, zoom = 1) {
    console.time("render");
    const [w, h] = this.size;
    const pixelScale = PIXELS_PER_METRE * zoom;

    this.ctx.resetTransform();
    this.ctx.clearRect(0, 0, w, h);
    if (!this.visible) return;

    const translation = offset.add(this.center);
    if (this.grid) this.renderGrid(translation, pixelScale);
    this.ctx.translate(translation.x, translation.y);

    scene.forEach((mesh) => this.renderMesh(mesh, pixelScale));
    console.timeEnd("render");
  }

  private renderMesh(mesh: Mesh, pixelScale: number) {
    const points = mesh.shapeWorld.map((point) => point.multiplyScalar(pixelScale));
    const [first, ...rest] = points;
    // color
    this.ctx.strokeStyle = mesh.strokeColor;
    this.ctx.fillStyle = mesh.fillColor;

    // path
    this.ctx.beginPath();
    this.ctx.moveTo(first.x, first.y);
    rest.forEach(({ x, y }) => this.ctx.lineTo(x, y));
    this.ctx.closePath();
    if (mesh.fill) this.ctx.fill();
    if (this.outlines) this.ctx.stroke();

    // draw vertices and origin
    if (this.vertices) {
      this.ctx.fillStyle = "#000";
      points.forEach((point) => this.renderVertex(point, 2));
    }

    if (this.annotations) {
      const { x, y } = mesh.position.multiplyScalar(pixelScale);
      this.ctx.fillStyle = "#000";
      this.ctx.textAlign = "center";
      this.ctx.font = "10px Arial";
      this.ctx.fillText(mesh.name, x, y + 6);
    }
  }

  private renderVertex(position: Vector, radius: number) {
    const [x, y] = position;
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, radius, radius, 0, 0, 360);
    this.ctx.fill();
  }

  private renderGrid = (offset: Vector, pixelScale: number) => {
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
