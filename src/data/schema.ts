/**
 * Actual Size on Screen — Core Data Schema
 *
 * CANONICAL UNIT: All physical dimensions are stored in millimeters (mm).
 * The rendering engine converts mm → px at runtime using the calibrated DPI.
 * Never store dimensions in inches or cm in the data files.
 */

// ─── Shape ────────────────────────────────────────────────────────────────────

export type ObjectShape = "rect" | "circle" | "oval";

// ─── Category ─────────────────────────────────────────────────────────────────

export type CategoryId =
  | "coins"
  | "credit-cards"
  | "paper"
  | "phones"
  | "currency"
  | "keys"
  | "monitors"
  | "lumber";

// ─── Dimensions ───────────────────────────────────────────────────────────────

export interface ObjectDimensions {
  /** Physical width in millimeters */
  widthMm: number;
  /** Physical height in millimeters */
  heightMm: number;
  /** Shape determines how border-radius is applied */
  shape: ObjectShape;
  /** Optional depth for reference (not rendered) */
  depthMm?: number;
}

// ─── Display ──────────────────────────────────────────────────────────────────

export interface ObjectDisplay {
  /** CSS color string — fill when no image is available */
  color: string;
  /** Optional CSS color string for object border/edge */
  borderColor?: string;
  /** Absolute path to WebP image e.g. "/images/objects/coins/us-quarter.webp" */
  image?: string;
  /** Alt text for the image */
  imageAlt?: string;
  /** When true, draws mm tick marks along the rendered object edges */
  showRulerOverlay?: boolean;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

export interface ObjectMeta {
  /** Full SEO page title (≤ 60 chars) */
  title: string;
  /** SEO meta description (≤ 155 chars) */
  description: string;
  /** Visible H1 on the object page */
  h1: string;
  /** 3–5 factual bullet points displayed on the object page */
  facts: string[];
  /** Slugs of related objects used for internal linking */
  relatedSlugs: string[];
  /** Source URL for the dimension data */
  source?: string;
  /** ISO date string "YYYY-MM-DD" — used for sitemap lastmod */
  updatedAt: string;
}

// ─── Core Object ──────────────────────────────────────────────────────────────

export interface ActualSizeObject {
  /** Globally unique, URL-safe identifier e.g. "us-quarter" */
  id: string;
  /** URL path segment — must match id */
  slug: string;
  /** Human-readable display name e.g. "US Quarter" */
  name: string;
  /** Category this object belongs to */
  category: CategoryId;
  /** Searchable tags */
  tags: string[];
  dimensions: ObjectDimensions;
  display: ObjectDisplay;
  meta: ObjectMeta;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: CategoryId;
  /** URL path segment */
  slug: string;
  /** Human-readable name e.g. "Coins" */
  name: string;
  /** Single emoji representing the category */
  icon: string;
  /** Short description shown on category cards */
  description: string;
  /** SEO title for the category landing page */
  metaTitle: string;
  /** SEO meta description for the category landing page */
  metaDescription: string;
}

// ─── Calibration ──────────────────────────────────────────────────────────────

export type CalibrationMethod = "credit-card" | "coin" | "monitor" | "default";
export type CalibrationConfidence = "high" | "medium" | "low";

export interface CalibrationState {
  /** Dots per inch — the core value driving all rendering */
  dpi: number;
  method: CalibrationMethod;
  /** ISO timestamp */
  calibratedAt: string;
  confidence: CalibrationConfidence;
}

/** Default calibration — 96 DPI is the CSS reference pixel, lowest confidence */
export const DEFAULT_CALIBRATION: CalibrationState = {
  dpi: 96,
  method: "default",
  calibratedAt: new Date(0).toISOString(),
  confidence: "low",
};

// ─── Known Calibration Objects ────────────────────────────────────────────────

/** Real-world objects with known exact dimensions used for calibration */
export const CALIBRATION_OBJECTS = {
  creditCard: { widthMm: 85.6, heightMm: 53.98, name: "Credit Card", standard: "ISO/IEC 7810 ID-1" },
  usQuarter:  { diameterMm: 24.26, name: "US Quarter" },
  usPenny:    { diameterMm: 19.05, name: "US Penny" },
  usDime:     { diameterMm: 17.91, name: "US Dime" },
  euro1:      { diameterMm: 23.25, name: "€1 Euro Coin" },
} as const;
