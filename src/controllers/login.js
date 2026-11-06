const express = require('express');
const bcrypt = require('bcryptjs');
const Session = require('../models/session');
const User = require('../models/user');
const HttpError = require('../util/httpError');
const { createToken } = require('../util/auth');

const router = express.Router();

router.post('/', async (request, response, next) => {
  const { username, password } = request.body || {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return next(new HttpError(400, 'Username and password are required'));
  }

  try {
    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'passwordHash', 'disabled'],
    });
    if (
      !user
      || user.disabled
      || !user.passwordHash
      || !(await bcrypt.compare(password, user.passwordHash))
    ) {
      return next(new HttpError(401, 'Invalid username or password'));
    }

    const session = await Session.create({ userId: user.id });
    response.json({ token: createToken(user, session), username: user.username });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
