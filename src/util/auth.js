const jwt = require('jsonwebtoken');
const HttpError = require('./httpError');
const Session = require('../models/session');
const User = require('../models/user');

function createToken(user, session) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set.');
  }

  return jwt.sign({ userId: user.id, sessionId: session.id }, secret, { expiresIn: '1h' });
}

async function authenticateToken(request, _response, next) {
  const authorization = request.get('authorization');
  const match = authorization && authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return next(new HttpError(401, 'Authorization token required'));
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not set.');
    }

    const decoded = jwt.verify(match[1], secret);
    if (
      !decoded
      || !Number.isSafeInteger(decoded.userId)
      || typeof decoded.sessionId !== 'string'
    ) {
      return next(new HttpError(401, 'Invalid authorization token'));
    }

    const session = await Session.findByPk(decoded.sessionId);
    if (!session || session.userId !== decoded.userId) {
      return next(new HttpError(401, 'Invalid or expired authorization token'));
    }

    const user = await User.findByPk(decoded.userId, { attributes: ['id', 'disabled'] });
    if (!user) {
      return next(new HttpError(401, 'Invalid authorization token'));
    }
    if (user.disabled) {
      return next(new HttpError(403, 'User account is disabled'));
    }

    request.userId = decoded.userId;
    request.sessionId = session.id;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return next(new HttpError(401, 'Invalid or expired authorization token'));
    }
    next(error);
  }
}

module.exports = { authenticateToken, createToken };
