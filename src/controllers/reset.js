const express = require('express');
const sequelize = require('../util/db');
const HttpError = require('../util/httpError');

const router = express.Router();

router.post('/', async (_request, response, next) => {
  if (process.env.TESTING !== 'true') {
    return next(new HttpError(404, 'Not found'));
  }

  try {
    await sequelize.query('TRUNCATE TABLE "blogs", "users" RESTART IDENTITY CASCADE');
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
