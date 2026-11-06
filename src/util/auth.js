const jwt = require('jsonwebtoken');
const HttpError = require('./httpError');

function createToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set.');
  }

  return jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });
}

function authenticateToken(request, _response, next) {
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
    if (!decoded || !Number.isSafeInteger(decoded.userId)) {
      return next(new HttpError(401, 'Invalid authorization token'));
    }
    request.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return next(new HttpError(401, 'Invalid or expired authorization token'));
    }
    next(error);
  }
}

module.exports = { authenticateToken, createToken };
