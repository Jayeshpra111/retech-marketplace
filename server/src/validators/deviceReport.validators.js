// server/src/validators/deviceReport.validators.js
const { z } = require('zod');

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

const parseBoolean = (val, fallback = true) => {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'boolean') return val;
  if (val === 'true' || val === '1' || val === 1) return true;
  if (val === 'false' || val === '0' || val === 0) return false;
  return fallback;
};

const deviceReportSchema = z.object({
  deviceType: z
    .enum(['phone', 'laptop', 'tablet', 'gpu', 'desktop', 'component', 'other'])
    .default('other'),

  battery: z.preprocess(
    (v) => parseJsonOrValue(v, {}),
    z
      .object({
        healthPercent: z
          .preprocess(
            (v) => (v === null || v === undefined || v === '' ? null : Number(v)),
            z.number().min(0).max(100).nullable().default(null)
          ),
        cycleCount: z
          .preprocess(
            (v) => (v === null || v === undefined || v === '' ? null : Number(v)),
            z.number().min(0).nullable().default(null)
          ),
        chargesProperly: z.preprocess((v) => parseBoolean(v, true), z.boolean().default(true)),
      })
      .default({})
  ),

  screen: z.preprocess(
    (v) => parseJsonOrValue(v, {}),
    z
      .object({
        deadPixels: z.preprocess((v) => parseBoolean(v, false), z.boolean().default(false)),
        burnIn: z.preprocess((v) => parseBoolean(v, false), z.boolean().default(false)),
        touchWorks: z.preprocess((v) => parseBoolean(v, true), z.boolean().default(true)),
        scratches: z.enum(['none', 'micro', 'visible', 'cracked']).default('none'),
      })
      .default({})
  ),

  ports: z.preprocess(
    (v) => {
      const parsed = parseJsonOrValue(v, []);
      return Array.isArray(parsed) ? parsed : [];
    },
    z
      .array(
        z.object({
          name: z.string().min(1),
          works: z.preprocess((v) => parseBoolean(v, true), z.boolean().default(true)),
        })
      )
      .default([])
  ),

  storage: z.preprocess(
    (v) => parseJsonOrValue(v, {}),
    z
      .object({
        sizeGB: z
          .preprocess(
            (v) => (v === null || v === undefined || v === '' ? null : Number(v)),
            z.number().min(0).nullable().default(null)
          ),
        smartStatus: z.enum(['healthy', 'warning', 'failing', 'untested']).default('healthy'),
      })
      .default({})
  ),

  camera: z.preprocess((v) => parseBoolean(v, true), z.boolean().default(true)),
  speakers: z.preprocess((v) => parseBoolean(v, true), z.boolean().default(true)),
  wifiBluetooth: z.preprocess((v) => parseBoolean(v, true), z.boolean().default(true)),
  notes: z.string().max(1000).default(''),
});

module.exports = { deviceReportSchema };
