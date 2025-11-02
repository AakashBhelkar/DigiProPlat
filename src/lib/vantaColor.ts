// Utility to resolve a color string (CSS variable, HSL, hex, rgb) to a hex or rgb string for Vanta/three.js
export function resolveVantaColor(input: string): string {
  if (!input) return '#000';

  // If input is a CSS variable (e.g., --primary), get its computed value
  if (input.startsWith('--')) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(input).trim();
    if (value) return resolveVantaColor(value);
  }

  // If input is already hex or rgb(a), return as is
  if (/^#([0-9a-f]{3,8})$/i.test(input) || input.startsWith('rgb')) {
    return input;
  }

  // If input is HSL in Tailwind format: '220 9% 23%'
  const hslMatch = input.match(/^(\d{1,3})\s+(\d{1,3})%\s+(\d{1,3})%$/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10);
    const s = parseInt(hslMatch[2], 10) / 100;
    const l = parseInt(hslMatch[3], 10) / 100;
    // Convert HSL to RGB
    const a = s * Math.min(l, 1 - l);
    function f(n: number) {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color);
    }
    return `rgb(${f(0)},${f(8)},${f(4)})`;
  }

  // If input is a named color, let three.js try to parse it
  return input;
} 