// e^(-(x - 0.5)² / 2*5²)
// e^(-(x)^2/(2 5^2))/(sqrt(2 π) 5)

export const gaussian = (x: number, sigma = 4) =>
  3 *
  (Math.pow(Math.E, -Math.pow(x - 0.5, 2) / (2 * Math.pow(sigma, 2))) - 0.9);
