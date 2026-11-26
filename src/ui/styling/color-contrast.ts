function channel(hex: string, start: number): number {
  const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** The relative luminance of a `#rrggbb` color, as WCAG defines it. */
function luminance(hex: string): number {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
}

/** The WCAG contrast ratio between two `#rrggbb` colors, from 1 (none) to 21 (black on white). */
export function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

/** The `--name: #rrggbb;` colors declared in the `:root` block of a stylesheet. */
export function readColorTokens(stylesheet: string): Map<string, string> {
  const root = /:root\s*\{([^}]*)\}/.exec(stylesheet)?.[1] ?? "";
  const tokens = new Map<string, string>();
  for (const [, name, value] of root.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    if (name !== undefined && value !== undefined) {
      tokens.set(name, value);
    }
  }
  return tokens;
}
