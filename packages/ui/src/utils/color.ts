import { COLOR_THRESHOLD } from '#constants/color';
import chroma from 'chroma-js';

export const defaultThemeColor = {
  50: '229 242 255',
  100: '184 209 232',
  200: '138 175 210',
  300: '92 141 188',
  400: '46 107 166',
  500: '0 73 144',
  600: '0 61 122',
  700: '0 49 98',
  800: '0 37 74',
  900: '0 25 50',
  950: '0 13 26',
}

const isValidHexColor = (color: string): boolean => {
  if (!color || typeof color !== 'string') {
    return false
  }

  // Remove whitespace and convert to lowercase
  const cleanColor = color.trim().toLowerCase()

  // Regex pattern explanation:
  // ^          - Start of string
  // #?         - Optional hash symbol
  // [0-9a-f]   - Hex characters (0-9, a-f)
  // {3}|{6}    - Either 3 or 6 characters
  // $          - End of string
  const hexColorPattern = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/

  return hexColorPattern.test(cleanColor)
}

/**
 * @param hexcolor - A hex color string (e.g., "#ff0000", "#f00", "ff0000", "f00")
 * @returns - "light" if text should be light (white), 
 *            "dark" if text should be dark (black),
 */
export function getReadableTextColor(hexColor: string): 'light' | 'dark' {
  if (!hexColor || typeof hexColor !== 'string') return 'light';

  const fullHex = hexColor.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_, r, g, b) => {
    return `#${r}${r}${g}${g}${b}${b}`;
  });

  const sanitized = fullHex.replace(/^#/, '');

  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);

  // calculate luminance
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > COLOR_THRESHOLD ? 'dark' : 'light';
}

export function generateTailwindPalette(baseColor: string): Record<number, string> {
  if (!baseColor || typeof baseColor !== 'string' || !isValidHexColor(baseColor)) return defaultThemeColor;

  const scale = chroma.scale(['#ffffff', baseColor, '#000000']).mode('lab').colors(13)
  const steps = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000]

  const palette: Record<number, string> = {};
  steps.forEach((step, idx) => {
    const rgb = chroma(scale[idx]).rgb()
    palette[step] = rgb.map(Math.round).join(' ')
  });

  return palette;
}

export const resetTheme = () => {
  document.documentElement.style.setProperty(`--color-primary-contrast`, defaultThemeColor[50]);
  document.documentElement.style.setProperty(`--color-primary-surface`, defaultThemeColor[500]);
  Object.entries(defaultThemeColor).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--color-primary-${key}`, value);
  });
}
