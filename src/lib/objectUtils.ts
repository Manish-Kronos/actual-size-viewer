/**
 * Object data loading and utility functions.
 * These run at build time in Astro's getStaticPaths / page frontmatter.
 */
import type { ActualSizeObject, Category, CategoryId } from "../data/schema";

// ─── Raw JSON imports ─────────────────────────────────────────────────────────
// Astro resolves these at build time. Add new data files here.

import coinsRaw from "../data/objects/coins.json";
import creditCardsRaw from "../data/objects/credit-cards.json";
import paperRaw from "../data/objects/paper.json";
import phonesRaw from "../data/objects/phones.json";
import currencyRaw from "../data/objects/currency.json";
import categoriesRaw from "../data/categories.json";

// ─── Typed collections ────────────────────────────────────────────────────────

/** All objects across all categories, typed */
export const ALL_OBJECTS: ActualSizeObject[] = [
  ...(coinsRaw as ActualSizeObject[]),
  ...(creditCardsRaw as ActualSizeObject[]),
  ...(paperRaw as ActualSizeObject[]),
  ...(phonesRaw as ActualSizeObject[]),
  ...(currencyRaw as ActualSizeObject[]),
];

/** All categories, typed */
export const ALL_CATEGORIES: Category[] = categoriesRaw as Category[];

// ─── Lookup utilities ─────────────────────────────────────────────────────────

/** Get a single object by its slug */
export function getObjectBySlug(slug: string): ActualSizeObject | undefined {
  return ALL_OBJECTS.find((obj) => obj.slug === slug);
}

/** Get all objects in a category */
export function getObjectsByCategory(categoryId: CategoryId): ActualSizeObject[] {
  return ALL_OBJECTS.filter((obj) => obj.category === categoryId);
}

/** Get a category by its slug */
export function getCategoryBySlug(slug: string): Category | undefined {
  return ALL_CATEGORIES.find((cat) => cat.slug === slug);
}

/** Get related objects by their slugs */
export function getRelatedObjects(
  slugs: string[],
  exclude?: string
): ActualSizeObject[] {
  return slugs
    .filter((s) => s !== exclude)
    .map((s) => getObjectBySlug(s))
    .filter((obj): obj is ActualSizeObject => obj !== undefined);
}

// ─── Static path generation ───────────────────────────────────────────────────

/** Used in [category]/index.astro getStaticPaths() */
export function getCategoryPaths() {
  return ALL_CATEGORIES.map((cat) => ({
    params: { category: cat.slug },
    props: { category: cat, objects: getObjectsByCategory(cat.id) },
  }));
}

/** Used in [category]/[slug].astro getStaticPaths() */
export function getObjectPaths() {
  return ALL_OBJECTS.map((obj) => ({
    params: { category: obj.category, slug: obj.slug },
    props: { object: obj },
  }));
}
