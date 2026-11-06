require('dotenv').config();

const express = require('express');
const blogsRouter = require('./controllers/blogs');
const errorHandler = require('./util/middleware');

const app = express();
app.use(express.json());
app.use('/api/blogs', blogsRouter);
app.use(errorHandler);

module.exports = app;
