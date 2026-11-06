require('dotenv').config();

const express = require('express');
const { DataTypes, Sequelize, ValidationError } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and set your database URL.');
}

const sequelize = new Sequelize(databaseUrl, { logging: console.log });
const Blog = sequelize.define(
  'Blog',
  {
    author: DataTypes.STRING,
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'blogs',
    timestamps: false,
  },
);

const app = express();
app.use(express.json());

app.get('/api/blogs', async (_request, response, next) => {
  try {
    const blogs = await Blog.findAll();
    response.json(blogs);
  } catch (error) {
    next(error);
  }
});

app.post('/api/blogs', async (request, response, next) => {
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

app.delete('/api/blogs/:id', async (request, response, next) => {
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

app.use((error, _request, response, _next) => {
  console.error(error);
  if (error instanceof ValidationError || error.status === 400 || error.status === 413) {
    return response.status(error.status || 400).json({ error: error.message });
  }
  response.status(500).json({ error: 'Internal server error' });
});

module.exports = { app, sequelize };
