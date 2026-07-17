/**
 * Unit conversion utilities for display purposes.
 * Used in Astro components to show dimensions in multiple units.
 */

/** Round to N decimal places */
export function round(value: number, decimals: number = 2): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

/** Convert mm → cm */
export function mmToCm(mm: number): number {
  return round(mm / 10, 2);
}

/** Convert mm → inches */
export function mmToIn(mm: number): number {
  return round(mm / 25.4, 3);
}

/** Convert inches → mm */
export function inToMm(inches: number): number {
  return round(inches * 25.4, 2);
}

/** Format a dimension with unit label, e.g. "24.26 mm", "0.955 in" */
export function formatDimension(mm: number, unit: "mm" | "cm" | "in"): string {
  switch (unit) {
    case "mm": return `${round(mm, 2)} mm`;
    case "cm": return `${mmToCm(mm)} cm`;
    case "in": return `${mmToIn(mm)} in`;
  }
}

/** Return a human-readable size string: "85.60 × 53.98 mm" */
export function formatSize(widthMm: number, heightMm: number, unit: "mm" | "cm" | "in" = "mm"): string {
  const w = unit === "mm" ? round(widthMm, 2) : unit === "cm" ? mmToCm(widthMm) : mmToIn(widthMm);
  const h = unit === "mm" ? round(heightMm, 2) : unit === "cm" ? mmToCm(heightMm) : mmToIn(heightMm);
  return `${w} × ${h} ${unit}`;
}

/** For circles (shape = "circle"), widthMm === heightMm. Return diameter. */
export function formatDiameter(diameterMm: number, unit: "mm" | "cm" | "in" = "mm"): string {
  return `⌀ ${formatDimension(diameterMm, unit)}`;
}
