export const PI2 = Math.PI * 2;
export const { sin, cos, atan } = Math;

export const mod = (target: number, n: number) => {
  return ((target % n) + n) % n;
};
