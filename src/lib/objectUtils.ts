import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { ActualSizeObject, Category, CategoryId } from "../data/schema";

interface ObjectIndex {
  objects: ActualSizeObject[];
  categories: Category[];
  objectMap: Map<string, ActualSizeObject>;
  categoryMap: Map<string, Category>;
}

let _cache: ObjectIndex | null = null;

function toObj(e: CollectionEntry<"objects">): ActualSizeObject {
  return e.data as ActualSizeObject;
}

function toCat(e: CollectionEntry<"categories">): Category {
  return e.data as Category;
}

async function load(): Promise<ObjectIndex> {
  if (_cache) return _cache;

  const [objEntries, catEntries] = await Promise.all([
    getCollection("objects"),
    getCollection("categories"),
  ]);

  const objects = objEntries.map(toObj);
  const categories = catEntries.map(toCat);

  const objectMap = new Map<string, ActualSizeObject>();
  for (const obj of objects) objectMap.set(obj.slug, obj);

  const categoryMap = new Map<string, Category>();
  for (const cat of categories) categoryMap.set(cat.id, cat);

  _cache = { objects, categories, objectMap, categoryMap };
  return _cache;
}

export async function getObjectBySlug(slug: string): Promise<ActualSizeObject | undefined> {
  const idx = await load();
  return idx.objectMap.get(slug);
}

export async function getObjectsByCategory(categoryId: CategoryId): Promise<ActualSizeObject[]> {
  const idx = await load();
  return idx.objects.filter((o) => o.category === categoryId);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const idx = await load();
  return idx.categoryMap.get(slug);
}

export async function getRelatedObjects(
  slugs: string[],
  exclude?: string
): Promise<ActualSizeObject[]> {
  const idx = await load();
  return slugs
    .filter((s) => s !== exclude)
    .map((s) => idx.objectMap.get(s))
    .filter((obj): obj is ActualSizeObject => obj !== undefined);
}

export async function getCategoryPaths() {
  const idx = await load();
  return idx.categories.map((cat) => ({
    params: { category: cat.slug },
    props: { category: cat, objects: idx.objects.filter((o) => o.category === cat.id) },
  }));
}

export async function getObjectPaths() {
  const idx = await load();
  return idx.objects.map((obj) => ({
    params: { category: obj.category, slug: obj.slug },
    props: { object: obj },
  }));
}
