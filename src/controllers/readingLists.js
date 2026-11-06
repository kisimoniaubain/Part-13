const express = require('express');
const Blog = require('../models/blog');
const ReadingList = require('../models/readingList');
const User = require('../models/user');
const HttpError = require('../util/httpError');

const router = express.Router();

router.post('/', async (request, response, next) => {
  if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
    return next(new HttpError(400, 'Request body must be a JSON object'));
  }

  const { blogId, userId } = request.body;
  if (!Number.isSafeInteger(blogId) || blogId < 1) {
    return next(new HttpError(400, 'blogId must be a positive integer'));
  }
  if (!Number.isSafeInteger(userId) || userId < 1) {
    return next(new HttpError(400, 'userId must be a positive integer'));
  }

  try {
    const user = await User.findByPk(userId, { attributes: ['id'] });
    if (!user) {
      return next(new HttpError(404, 'User not found'));
    }

    const blog = await Blog.findByPk(blogId, { attributes: ['id'] });
    if (!blog) {
      return next(new HttpError(404, 'Blog not found'));
    }

    const existingEntry = await ReadingList.findOne({ where: { userId, blogId } });
    if (existingEntry) {
      return next(new HttpError(409, "Blog is already in this user's reading list"));
    }

    const readingListEntry = await ReadingList.create({ userId, blogId });
    response.status(201).json(readingListEntry);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
