const express = require('express');
const Blog = require('../models/blog');

const router = express.Router();

router.get('/', async (_request, response, next) => {
  try {
    const blogs = await Blog.findAll();
    response.json(blogs);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
    return response.status(400).json({ error: 'Request body must be a JSON object' });
  }

  try {
    const blog = await Blog.create(request.body);
    response.status(201).json(blog);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (request, response, next) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return response.status(400).json({ error: 'Blog id must be a positive integer' });
  }
  if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
    return response.status(400).json({ error: 'Request body must be a JSON object' });
  }
  if (!Number.isInteger(request.body.likes) || request.body.likes < 0) {
    return response.status(400).json({ error: 'Likes must be a non-negative integer' });
  }

  try {
    const blog = await Blog.findByPk(id);
    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' });
    }

    blog.likes = request.body.likes;
    await blog.save();
    response.json(blog);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (request, response, next) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return response.status(400).json({ error: 'Blog id must be a positive integer' });
  }

  try {
    const deletedCount = await Blog.destroy({ where: { id } });
    if (deletedCount === 0) {
      return response.status(404).json({ error: 'Blog not found' });
    }
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
