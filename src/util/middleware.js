const { ValidationError } = require('sequelize');

function errorHandler(error, _request, response, _next) {
  const isValidationError = error instanceof ValidationError;
  const statusCode = isValidationError
    ? 400
    : error.statusCode || error.status || 500;
  const messages = isValidationError
    ? error.errors.map((validationError) => validationError.message)
    : null;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal server error' : messages || error.message,
  });
}

module.exports = errorHandler;
