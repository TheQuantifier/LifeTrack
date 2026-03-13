export function errorHandler(error, _req, res, _next) {
  const status = Number(error.status || 500);
  res.status(status).json({
    error: error.message || "Unexpected server error",
  });
}
