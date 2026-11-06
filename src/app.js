require('dotenv').config();

const express = require('express');
require('./models/associations');
const authorsRouter = require('./controllers/authors');
const blogsRouter = require('./controllers/blogs');
const loginRouter = require('./controllers/login');
const readingListsRouter = require('./controllers/readingLists');
const resetRouter = require('./controllers/reset');
const usersRouter = require('./controllers/users');
const errorHandler = require('./util/middleware');

const app = express();
app.use(express.json());
app.get('/', (_request, response) => {
  response.sendStatus(200);
});
app.use('/api/reset', resetRouter);
app.use('/api/readinglists', readingListsRouter);
app.use('/api/authors', authorsRouter);
app.use('/api/blogs', blogsRouter);
app.use('/api/login', loginRouter);
app.use('/api/users', usersRouter);
app.use(errorHandler);

module.exports = app;
