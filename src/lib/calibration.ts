/**
 * Build-time calibration math helpers.
 * These run in Node during Astro's build step — never shipped to browser.
 */

/** Standard CSS reference DPI (browser default when no calibration exists) */
export const STANDARD_DPI = 96;

/**
 * Convert millimeters to CSS pixels at a given DPI.
 * Formula: (mm / 25.4) * dpi
 */
export function mmToPx(mm: number, dpi: number = STANDARD_DPI): number {
  return (mm / 25.4) * dpi;
}

/**
 * Convert inches to CSS pixels at a given DPI.
 */
export function inToPx(inches: number, dpi: number = STANDARD_DPI): number {
  return inches * dpi;
}

/**
 * Convert CSS pixels to millimeters at a given DPI.
 * Used to compute DPI from a known physical size.
 */
export function pxToMm(px: number, dpi: number = STANDARD_DPI): number {
  return (px / dpi) * 25.4;
}

/**
 * Compute DPI from a known physical width (mm) and the measured pixel width.
 * Used by the credit-card calibration method:
 *   dpi = (measuredPx / physicalMm) * 25.4
 */
export function computeDpiFromMm(physicalMm: number, measuredPx: number): number {
  return (measuredPx / physicalMm) * 25.4;
}

/**
 * Compute DPI from monitor diagonal size and screen resolution.
 * @param diagonalInches - Physical screen diagonal (e.g. 27)
 * @param widthPx - screen.width in CSS pixels
 * @param heightPx - screen.height in CSS pixels
 */
export function computeDpiFromDiagonal(
  diagonalInches: number,
  widthPx: number,
  heightPx: number
): number {
  const diagonalPx = Math.sqrt(widthPx ** 2 + heightPx ** 2);
  return diagonalPx / diagonalInches;
}

/** Round DPI to 2 decimal places for storage */
export function roundDpi(dpi: number): number {
  return Math.round(dpi * 100) / 100;
}
