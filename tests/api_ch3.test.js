require('dotenv').config();

const { before, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { baseUrl, request, resetDatabase, createUser, login } = require('./helper');
const Blog = require('../src/models/blog');
const ReadingList = require('../src/models/readingList');
const Session = require('../src/models/session');
const User = require('../src/models/user');

let users;
let tokens;

before(async () => {
  await resetDatabase();
  users = await Promise.all([
    createUser('test1@example.com', 'Test User 1', 'password123'),
    createUser('test2@example.com', 'Test User 2', 'password456'),
  ]);
  tokens = await Promise.all([
    login('test1@example.com', 'password123'),
    login('test2@example.com', 'password456'),
  ]);
});

describe('Checkup endpoints', () => {
  it('GET / responds with HTTP 200', async () => {
    const response = await fetch('http://localhost:3001/');
    assert.equal(response.status, 200);
  });

  it('reset clears the test database', async () => {
    const blog = await Blog.create({
      title: 'Reset Check Blog',
      author: 'Reset Check',
      url: 'https://example.com/reset-check',
      userId: users[0].id,
    });
    await ReadingList.create({ userId: users[0].id, blogId: blog.id });

    await resetDatabase();
    const { response, body } = await request('/blogs');
    assert.equal(response.status, 200);
    assert.deepEqual(body, []);
    assert.equal(await ReadingList.count(), 0);
    assert.equal(await Session.count(), 0);

    users = await Promise.all([
      createUser('test1@example.com', 'Test User 1', 'password123'),
      createUser('test2@example.com', 'Test User 2', 'password456'),
    ]);
    tokens = await Promise.all([
      login('test1@example.com', 'password123'),
      login('test2@example.com', 'password456'),
    ]);
  });
});

describe('Blogs API', () => {
  it('returns an empty JSON array after reset', async () => {
    const { response, body } = await request('/blogs');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /application\/json/);
    assert.deepEqual(body, []);
  });

  it('creates a blog with authentication and defaults likes to zero', async () => {
    const { response, body } = await request('/blogs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens[0]}` },
      body: JSON.stringify({
        title: 'Checkup Blog Post',
        author: 'Checkup Author',
        url: 'https://example.com/checkup-blog',
      }),
    });

    assert.equal(response.status, 201);
    assert.equal(body.title, 'Checkup Blog Post');
    assert.equal(body.likes, 0);
    assert.equal(body.userId, users[0].id);
    assert.ok(body.createdAt);
    assert.ok(body.updatedAt);
  });

  it('lists the created blog and supports updating likes', async () => {
    const listed = await fetch(`${baseUrl}/blogs`).then((response) => response.json());
    assert.equal(listed.length, 1);
    assert.equal(listed[0].title, 'Checkup Blog Post');

    const { response, body } = await request(`/blogs/${listed[0].id}`, {
      method: 'PUT',
      body: JSON.stringify({ likes: 5 }),
    });
    assert.equal(response.status, 200);
    assert.equal(body.likes, 5);
  });

  it('accepts a valid year and rejects years outside the allowed range or non-integers', async () => {
    const valid = await request('/blogs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens[0]}` },
      body: JSON.stringify({
        title: 'Year Validation Blog',
        author: 'Year Validation Author',
        url: 'https://example.com/year-validation',
        year: 1991,
      }),
    });
    assert.equal(valid.response.status, 201);
    assert.equal(valid.body.year, 1991);

    for (const year of [1990, new Date().getFullYear() + 1, 2020.5]) {
      const { response, body } = await request('/blogs', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens[0]}` },
        body: JSON.stringify({
          title: `Invalid Year ${year}`,
          author: 'Checkup Author',
          url: `https://example.com/invalid-year-${year}`,
          year,
        }),
      });
      assert.equal(response.status, 400);
      assert.ok(Array.isArray(body.error));
      assert.ok(body.error.length > 0);
    }
  });
});

describe('Users and authors API', () => {
  it('lists the seeded users with blog arrays', async () => {
    const { response, body } = await request('/users');
    assert.equal(response.status, 200);
    assert.equal(body.length, 2);
    assert.ok(body.every((user) => user.id && user.username && user.name && Array.isArray(user.blogs)));
    assert.ok(body.every((user) => user.createdAt && user.updatedAt));
  });

  it('returns author statistics', async () => {
    const { response, body } = await request('/authors');
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.some((author) => author.author === 'Checkup Author'
      && Number(author.blogs) === 1 && Number(author.likes) === 5));
  });

  it('adds blogs to a user reading list and includes readings in the individual user route', async () => {
    const blogs = await fetch(`${baseUrl}/blogs`).then((response) => response.json());
    const blog = blogs.find((entry) => entry.title === 'Checkup Blog Post');

    const added = await request('/readinglists', {
      method: 'POST',
      body: JSON.stringify({ blogId: blog.id, userId: users[0].id }),
    });
    assert.equal(added.response.status, 201);
    assert.equal(added.body.read, false);

    const user = await request(`/users/${users[0].id}`);
    assert.equal(user.response.status, 200);
    const readingListId = user.body.readings[0].readingList.id;
    assert.ok(Number.isSafeInteger(readingListId));
    assert.deepEqual(user.body.readings, [{
      id: blog.id,
      url: blog.url,
      title: blog.title,
      author: blog.author,
      likes: blog.likes,
      year: blog.year,
      readingList: {
        id: readingListId,
        read: false,
      },
    }]);
  });

  it('reports invalid reading-list user and blog ids', async () => {
    const blogs = await fetch(`${baseUrl}/blogs`).then((response) => response.json());
    const blogId = blogs[0].id;

    const invalidUser = await request('/readinglists', {
      method: 'POST',
      body: JSON.stringify({ blogId, userId: 999999 }),
    });
    assert.equal(invalidUser.response.status, 404);
    assert.equal(invalidUser.body.error, 'User not found');

    const invalidBlog = await request('/readinglists', {
      method: 'POST',
      body: JSON.stringify({ blogId: 999999, userId: users[0].id }),
    });
    assert.equal(invalidBlog.response.status, 404);
    assert.equal(invalidBlog.body.error, 'Blog not found');
  });

  it('lets only the reading-list owner mark a blog as read', async () => {
    const blogs = await fetch(`${baseUrl}/blogs`).then((response) => response.json());
    const blog = blogs.find((entry) => entry.title === 'Checkup Blog Post');
    const added = await request('/readinglists', {
      method: 'POST',
      body: JSON.stringify({ blogId: blog.id, userId: users[1].id }),
    });
    assert.equal(added.response.status, 201);

    const userBeforeUpdate = await request(`/users/${users[1].id}`);
    const readingListId = userBeforeUpdate.body.readings
      .find((entry) => entry.id === blog.id).readingList.id;

    const forbidden = await request(`/readinglists/${readingListId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokens[0]}` },
      body: JSON.stringify({ read: true }),
    });
    assert.equal(forbidden.response.status, 403);

    const marked = await request(`/readinglists/${readingListId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokens[1]}` },
      body: JSON.stringify({ read: true }),
    });
    assert.equal(marked.response.status, 200);
    assert.equal(marked.body.read, true);

    const user = await request(`/users/${users[1].id}`);
    const reading = user.body.readings.find((entry) => entry.id === blog.id);
    assert.equal(reading.readingList.read, true);
    assert.equal(reading.readingList.id, readingListId);

    const readFilter = await request(`/users/${users[1].id}?read=true`);
    assert.equal(readFilter.response.status, 200);
    assert.deepEqual(readFilter.body.readings.map((entry) => entry.id), [blog.id]);

    const unreadFilter = await request(`/users/${users[1].id}?read=false`);
    assert.equal(unreadFilter.response.status, 200);
    assert.deepEqual(unreadFilter.body.readings, []);

    const allReadings = await request(`/users/${users[1].id}`);
    assert.equal(allReadings.response.status, 200);
    assert.deepEqual(allReadings.body.readings.map((entry) => entry.id), [blog.id]);
  });

  it('blocks disabled users from logging in or using an existing session', async () => {
    await User.update({ disabled: true }, { where: { id: users[0].id } });
    try {
      const loginResult = await request('/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'test1@example.com', password: 'password123' }),
      });
      assert.equal(loginResult.response.status, 401);

      const blogResult = await request('/blogs', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens[0]}` },
        body: JSON.stringify({
          title: 'Disabled User Blog',
          author: 'Disabled User',
          url: 'https://example.com/disabled-user',
        }),
      });
      assert.equal(blogResult.response.status, 403);
    } finally {
      await User.update({ disabled: false }, { where: { id: users[0].id } });
    }
  });

  it('logs out and invalidates the active token', async () => {
    assert.equal(await Session.count({ where: { userId: users[0].id } }), 1);

    const logout = await request('/logout', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokens[0]}` },
    });
    assert.equal(logout.response.status, 204);
    assert.equal(await Session.count({ where: { userId: users[0].id } }), 0);

    const protectedRequest = await request('/blogs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens[0]}` },
      body: JSON.stringify({
        title: 'Logged Out Blog',
        author: 'Logged Out User',
        url: 'https://example.com/logged-out',
      }),
    });
    assert.equal(protectedRequest.response.status, 401);
  });
});
