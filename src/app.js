require('dotenv').config();

const express = require('express');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const errorHandler = require('./util/middleware');

const app = express();
app.use(express.json());
app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);
app.use(errorHandler);

module.exports = app;
