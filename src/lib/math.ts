export const PI2 = Math.PI * 2;
export const { sin, cos, atan, min, max } = Math;

export const mod = (v: number, n: number) => {
  return ((v % n) + n) % n;
};

export const round = (v: number) => {
  return v >> 0;
};

export const clamp = (v: number, a: number, b: number) => {
  return min(Math.max(v, a), b);
};
