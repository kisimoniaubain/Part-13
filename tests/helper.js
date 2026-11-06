const baseUrl = 'http://localhost:3001/api';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const body = response.status === 204 ? null : await response.json();
  return { response, body };
}

async function resetDatabase() {
  const { response } = await request('/reset', { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Reset failed with HTTP ${response.status}`);
  }
}

async function createUser(username, name, password) {
  const { response, body } = await request('/users', {
    method: 'POST',
    body: JSON.stringify({ username, name, password }),
  });
  if (!response.ok) {
    throw new Error(`User creation failed with HTTP ${response.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function login(username, password) {
  const { response, body } = await request('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error(`Login failed with HTTP ${response.status}`);
  }
  return body.token;
}

module.exports = { baseUrl, request, resetDatabase, createUser, login };
