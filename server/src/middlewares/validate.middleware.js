// src/middlewares/validate.middleware.js — Zod request validator
const AppError = require('../utils/AppError');

/**
 * Returns a middleware that validates req.body against a Zod schema.
 * Pass { query: true } to validate req.query instead.
 */
const validate = (schema, { query = false } = {}) =>
  (req, res, next) => {
    const result = schema.safeParse(query ? req.query : req.body);
    if (!result.success) {
      // Zod v4 uses result.error.issues (renamed from result.error.errors in Zod v3)
      const errors = result.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
    if (query) {
      req.validatedQuery = result.data;
    } else {
      req.body = result.data;
    }
    next();
  };

module.exports = validate;
