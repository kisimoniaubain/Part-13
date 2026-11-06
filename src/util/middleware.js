const { ValidationError } = require('sequelize');

function errorHandler(error, _request, response, _next) {
  console.error(error);
  if (error instanceof ValidationError || error.status === 400 || error.status === 413) {
    return response.status(error.status || 400).json({ error: error.message });
  }
  response.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
