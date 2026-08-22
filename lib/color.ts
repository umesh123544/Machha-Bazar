// Small color helpers used to turn a single admin-picked hex color into the
// light/dark/text variants the UI needs, without requiring the admin to pick
// several shades by hand.

type HSL = { h: number; s: number; l: number };

function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.trim().replace(/^#/, "");
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(clean, 16);
  if (clean.length !== 6 || Number.isNaN(num)) {
    return [43, 27, 51]; // fallback: default plum
  }
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** "R G B" triplet string for use with Tailwind's `rgb(var(--x) / <alpha-value>)` pattern. */
export function rgbTriplet(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

/** Same color, lightness shifted by deltaL (-1..1), as an "R G B" triplet. */
export function adjustLightness(hex: string, deltaL: number): string {
  const [r, g, b] = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const [nr, ng, nb] = hslToRgb(h, s, clamp01(l + deltaL));
  return `${nr} ${ng} ${nb}`;
}

/** A very dark, high-contrast shade of the color — good for text placed on top of it. */
export function darkTextShade(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const { h, s } = rgbToHsl(r, g, b);
  const [nr, ng, nb] = hslToRgb(h, Math.min(1, s + 0.1), 0.16);
  return `${nr} ${ng} ${nb}`;
}
