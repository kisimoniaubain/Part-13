const { before, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { baseUrl, request, resetDatabase, createUser, login } = require('./helper');

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
    await resetDatabase();
    const { response, body } = await request('/blogs');
    assert.equal(response.status, 200);
    assert.deepEqual(body, []);

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
});
