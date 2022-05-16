/** Mulberry 32 seeded random function */
const mulberry32 = (a: number) => {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

let value = mulberry32((Math.random() * 10000) << 0);

const range = (min: number, max: number) => {
  return min + value() * (max - min);
};

const select = <T>(array: T[]) => {
  return array[range(0, array.length) << 0];
};

const setSeed = (seed: number) => {
  value = mulberry32(seed);
};

export default {
  value,
  range,
  setSeed,
  select,
};
