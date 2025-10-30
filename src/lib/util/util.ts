export function roundDecimalPlace(x: number, d: number) {
  return Math.round(x * Math.pow(10, d + 1)) / Math.pow(10, d + 1);
}