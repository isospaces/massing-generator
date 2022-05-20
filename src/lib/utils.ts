import Line from "./line";
import GEO from "@flatten-js/core";

const { vector, point } = GEO;

export namespace COLORS {
  export const WHITE = "#ffffff";
  export const BLACK = "#000000";
  export const GREEN = "#00ff00";
  export const RED = "#ff0000";
}

export const sortByNormals = (lines: Line[]) => {
  return lines;
};

export const time = (name: string, fn: () => void) => {
  console.time(name);
  fn();
  console.timeEnd(name);
};

export const throttle = (fn: Function, wait: number = 300) => {
  let inThrottle: boolean, lastFn: ReturnType<typeof setTimeout>, lastTime: number;
  return function (this: any) {
    const context = this,
      args = arguments;
    if (!inThrottle) {
      fn.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};
