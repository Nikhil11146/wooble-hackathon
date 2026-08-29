/** Wrap async handlers so rejected promises reach Express's error handler. */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Keep this as the final middleware registered in server.js.
export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || "Internal server error.";

  if (error.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${error.path}.`;
  } else if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed.";
  } else if (error.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};
