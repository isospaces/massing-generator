export const { sin, cos, acos, atan, min, max, abs, PI, sqrt } = Math;

export const PI2 = PI * 2;

export const mod = (v: number, n: number) => {
  return ((v % n) + n) % n;
};

export const round = (v: number) => {
  return v >> 0;
};

export const clamp = (v: number, a: number, b: number) => {
  return min(Math.max(v, a), b);
};
