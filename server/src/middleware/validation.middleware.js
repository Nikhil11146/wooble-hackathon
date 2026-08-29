/**
 * Ensures the specified body fields are present and not blank strings.
 * Example: `validateRequiredFields(["email", "password"])`.
 */
export const validateRequiredFields = (fields) => {
  if (!Array.isArray(fields)) {
    throw new TypeError("validateRequiredFields expects an array of field names.");
  }

  return (req, res, next) => {
    const body = req.body || {};
    const missing = fields.filter((field) => {
      const value = body[field];
      return value === undefined || value === null || (typeof value === "string" && !value.trim());
    });

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: missing.map((field) => ({ field, message: `${field} is required.` })),
      });
    }

    return next();
  };
};

/**
 * Runs a custom validator and returns its field errors as a 400 response.
 * The validator may return an error array or a promise resolving to one.
 */
export const validate = (validator) => async (req, res, next) => {
  try {
    const errors = await validator(req);
    if (Array.isArray(errors) && errors.length) {
      return res.status(400).json({ success: false, message: "Validation failed.", errors });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Validates req.body against a Zod schema. On success, replaces req.body with
 * the parsed (trimmed/typed) data; on failure returns a 400 with field errors.
 * Example: `router.post("/", validateBody(registerSchema), handler)`.
 */
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
      })),
    });
  }

  req.body = result.data;
  return next();
};
