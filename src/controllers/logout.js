const express = require('express');
const { authenticateToken } = require('../util/auth');
const Session = require('../models/session');

const router = express.Router();

router.delete('/', authenticateToken, async (request, response, next) => {
  try {
    await Session.destroy({
      where: {
        id: request.sessionId,
        userId: request.userId,
      },
    });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
