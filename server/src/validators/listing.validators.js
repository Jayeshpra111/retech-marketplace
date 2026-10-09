// src/validators/listing.validators.js
const { z } = require('zod');

const conditionEnum = z.enum(['like_new', 'good', 'fair', 'needs_repair', 'for_parts']);

const parseJsonOrValue = (val, defaultVal) => {
  if (val === undefined || val === null || val === '') return defaultVal;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return defaultVal;
    }
  }
  return val;
};

const parseAccessories = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [val];
};

const parseBoolean = (val) => val === 'true' || val === true || val === 1 || val === '1';

const createListingSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(120),
  description: z.string().min(5, 'Description must be at least 5 characters').max(3000),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().max(60).default(''),
  model: z.string().max(60).default(''),
  price: z.coerce.number().min(0, 'Price must be positive'),
  negotiable: z.preprocess(parseBoolean, z.boolean().default(false)),
  condition: conditionEnum,
  ageInMonths: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(0).nullable().default(null)
  ),
  warrantyLeftMonths: z.coerce.number().int().min(0).default(0),
  hasBill: z.preprocess(parseBoolean, z.boolean().default(false)),
  accessories: z.preprocess(parseAccessories, z.array(z.string()).default([])),
  specs: z.preprocess((v) => parseJsonOrValue(v, {}), z.record(z.any()).default({})),
  serialNumber: z.string().max(100).default(''),
  location: z.preprocess(
    (v) => parseJsonOrValue(v, {}),
    z
      .object({
        city: z.string().default(''),
        state: z.string().default(''),
      })
      .default({})
  ),
});

const updateListingSchema = createListingSchema.partial();

const listingQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  condition: conditionEnum.optional(),
  city: z.string().optional(),
  isComponent: z.preprocess(parseBoolean, z.boolean()).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

module.exports = { createListingSchema, updateListingSchema, listingQuerySchema };
