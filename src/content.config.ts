import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const objects = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/objects" }),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    category: z.enum([
      "coins", "credit-cards", "paper", "phones", "currency",
      "keys", "monitors", "lumber",
    ]),
    tags: z.array(z.string()),
    dimensions: z.object({
      widthMm: z.number(),
      heightMm: z.number(),
      shape: z.enum(["rect", "circle", "oval"]),
      depthMm: z.number().optional(),
    }),
    display: z.object({
      color: z.string(),
      borderColor: z.string().optional(),
      image: z.string().optional(),
      imageAlt: z.string().optional(),
      showRulerOverlay: z.boolean().optional(),
    }),
    meta: z.object({
      title: z.string().max(65),
      description: z.string().max(160),
      h1: z.string(),
      facts: z.array(z.string()),
      relatedSlugs: z.array(z.string()),
      source: z.string().optional(),
      updatedAt: z.string(),
    }),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/categories" }),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    icon: z.string(),
    description: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
  }),
});

export const collections = { objects, categories };
