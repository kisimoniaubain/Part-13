const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Blog = require('../models/blog');
const HttpError = require('../util/httpError');

const router = express.Router();

router.get('/', async (_request, response, next) => {
  try {
    const users = await User.findAll({
      include: [{ model: Blog, as: 'blogs' }],
    });
    response.json(users);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
    return next(new HttpError(400, 'Request body must be a JSON object'));
  }

  const { name, username, password } = request.body;
  if (typeof password !== 'string' || password.length === 0) {
    return next(new HttpError(400, 'Password must not be empty'));
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, username, passwordHash });
    response.status(201).json({
      id: user.id,
      name: user.name,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:username', async (request, response, next) => {
  const { name } = request.body || {};
  if (typeof name !== 'string' || name.trim().length === 0) {
    return next(new HttpError(400, 'Name must not be empty'));
  }

  try {
    const user = await User.findOne({ where: { username: request.params.username } });
    if (!user) {
      return next(new HttpError(404, 'User not found'));
    }

    user.name = name;
    await user.save();
    response.json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (request, response, next) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return next(new HttpError(400, 'User id must be a positive integer'));
  }

  try {
    const user = await User.findByPk(id, {
      include: [{
        model: Blog,
        as: 'readings',
        attributes: ['id', 'url', 'title', 'author', 'likes', 'year'],
        through: { attributes: ['id', 'read'] },
      }],
    });
    if (!user) {
      return next(new HttpError(404, 'User not found'));
    }
    const userResponse = user.toJSON();
    userResponse.readings = userResponse.readings.map(({ ReadingList, ...blog }) => ({
      ...blog,
      readingList: {
        id: ReadingList.id,
        read: ReadingList.read,
      },
    }));
    response.json(userResponse);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
