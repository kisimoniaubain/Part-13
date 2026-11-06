const { ValidationError } = require('sequelize');

function errorHandler(error, _request, response, _next) {
  const statusCode = error instanceof ValidationError
    ? 400
    : error.statusCode || error.status || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal server error' : error.message,
  });
}

module.exports = errorHandler;
