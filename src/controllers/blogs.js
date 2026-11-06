const express = require('express');
const { Op } = require('sequelize');
const Blog = require('../models/blog');
const User = require('../models/user');
const HttpError = require('../util/httpError');
const { authenticateToken } = require('../util/auth');

const router = express.Router();

router.get('/', async (request, response, next) => {
  try {
    const where = request.query.search
      ? {
          [Op.or]: [
            { title: { [Op.iLike]: `%${request.query.search}%` } },
            { author: { [Op.iLike]: `%${request.query.search}%` } },
          ],
        }
      : undefined;
    const blogs = await Blog.findAll({
      where,
      include: [{ model: User, as: 'user' }],
      order: [['likes', 'DESC']],
    });
    response.json(blogs);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateToken, async (request, response, next) => {
  if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
    return next(new HttpError(400, 'Request body must be a JSON object'));
  }

  try {
    const { author, url, title, likes, year } = request.body;
    const blog = await Blog.create({
      author,
      url,
      title,
      likes,
      year,
      userId: request.userId,
    });
    response.status(201).json(blog);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (request, response, next) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return next(new HttpError(400, 'Blog id must be a positive integer'));
  }
  if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
    return next(new HttpError(400, 'Request body must be a JSON object'));
  }
  if (!Number.isInteger(request.body.likes) || request.body.likes < 0) {
    return next(new HttpError(400, 'Likes must be a non-negative integer'));
  }

  try {
    const blog = await Blog.findByPk(id);
    if (!blog) {
      return next(new HttpError(404, 'Blog not found'));
    }

    blog.likes = request.body.likes;
    await blog.save();
    response.json(blog);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateToken, async (request, response, next) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return next(new HttpError(400, 'Blog id must be a positive integer'));
  }

  try {
    const blog = await Blog.findByPk(id);
    if (!blog) {
      return next(new HttpError(404, 'Blog not found'));
    }
    if (blog.userId !== request.userId) {
      return next(new HttpError(403, 'Only the blog owner can delete this blog'));
    }

    await blog.destroy();
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
