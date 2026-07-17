/**
 * Build-time SEO string generators.
 * Generate consistent, unique SEO content from object data.
 */
import type { ActualSizeObject, Category } from "../data/schema";
import { mmToIn, mmToCm, round } from "./rendering";

/** Site base URL — must match astro.config.mjs site value */
export const SITE_URL = "https://onlineruler.org";
export const SITE_NAME = "ActualSize";

// ─── Object page SEO ──────────────────────────────────────────────────────────

export function getObjectPageTitle(obj: ActualSizeObject): string {
  return `${obj.meta.title} | ${SITE_NAME}`;
}

export function getObjectCanonicalUrl(obj: ActualSizeObject): string {
  return `${SITE_URL}/${obj.category}/${obj.slug}`;
}

/** Build a dimensions summary string like "24.26 mm × 24.26 mm" */
export function getDimensionSummary(obj: ActualSizeObject): string {
  const { widthMm, heightMm, shape } = obj.dimensions;
  if (shape === "circle") {
    return `⌀ ${round(widthMm, 2)} mm (${mmToIn(widthMm)} in)`;
  }
  return `${round(widthMm, 2)} × ${round(heightMm, 2)} mm (${mmToIn(widthMm)} × ${mmToIn(heightMm)} in)`;
}

// ─── Category page SEO ────────────────────────────────────────────────────────

export function getCategoryPageTitle(cat: Category): string {
  return `${cat.metaTitle} | ${SITE_NAME}`;
}

export function getCategoryCanonicalUrl(cat: Category): string {
  return `${SITE_URL}/${cat.slug}`;
}

// ─── Structured data (JSON-LD) ────────────────────────────────────────────────

export function buildObjectJsonLd(obj: ActualSizeObject, canonicalUrl: string) {
  const { widthMm, heightMm, shape } = obj.dimensions;
  const isCircle = shape === "circle";

  const additionalProperty = isCircle
    ? [{ "@type": "PropertyValue", name: "Diameter", value: `${round(widthMm, 2)} mm` }]
    : [
        { "@type": "PropertyValue", name: "Width",  value: `${round(widthMm, 2)} mm` },
        { "@type": "PropertyValue", name: "Height", value: `${round(heightMm, 2)} mm` },
      ];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: obj.name,
    description: obj.meta.description,
    url: canonicalUrl,
    additionalProperty,
    ...(obj.display.image ? { image: `${SITE_URL}${obj.display.image}` } : {}),
  };
}

export function buildCategoryJsonLd(cat: Category, canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.metaTitle,
    description: cat.metaDescription,
    url: canonicalUrl,
  };
}

export function buildWebAppJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Actual Size on Screen",
    url: SITE_URL,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description:
      "See hundreds of real-world objects at their true physical size on your screen after a one-time calibration.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

export function buildBreadcrumbJsonLd(
  crumbs: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}
