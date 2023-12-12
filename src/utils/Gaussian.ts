// e^(-(x - 0.5)² / 2*5²)
export const gaussian = (x: number, a = 1, b = 0.5, c = 5) =>
  Math.pow(Math.E, ((a * -Math.pow(x - b, 2)) / 2) * Math.pow(c, 2));
