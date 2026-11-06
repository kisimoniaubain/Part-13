# Part 13

Exercises for the Full Stack Open relational databases course.

## Database

The local development database runs in Docker. To connect with `psql`:

```powershell
docker exec -it blog-db psql -U postgres -d blogapp
```

## Running the blog backend

Install dependencies with `npm install`. Copy `.env.example` to `.env`, set
`DATABASE_URL`, and replace `JWT_SECRET` with a long random secret, then run:

```powershell
npm start
```

The checkup tests use a separate PostgreSQL database so your application data
is not reset. Create it once with
`docker exec blog-db psql -U postgres -d postgres -c "CREATE DATABASE test_db;"`,
set `TEST_DATABASE_URL` in `.env`, then run `npm run start:test` in one
terminal and `npm test` in another.

The API is available at `http://localhost:3001/api/blogs`:

- `GET /api/blogs` lists blogs by descending likes with their creating user; `?search=word` filters titles and authors case-insensitively
- `GET /api/authors` returns each author’s blog count and total likes, ordered by likes descending
- `GET /` returns HTTP 200
- `POST /api/reset` clears the test database and is disabled outside testing mode
- `POST /api/blogs` creates a blog for the authenticated user (`Authorization: Bearer <token>`)
- `PUT /api/blogs/:id` updates a blog's likes (JSON body: `{"likes": 3}`)
- `DELETE /api/blogs/:id` (Exercise 11) deletes a blog only when the authenticated user created it
- `POST /api/login` logs in with `{ "username": "email", "password": "..." }` and returns a token
- `GET /api/users` lists users with the blogs they created
- `POST /api/users` creates a user (JSON body includes `name`, a unique email `username`, and `password`; passwords are stored as hashes)
- `PUT /api/users/:username` updates a user's name
- `GET /api/users/:id` gets a user by ID

Run `node src/cli.js` to print the blogs in the console.

## Project structure

- `src/index.js` starts the server
- `src/app.js` configures the Express application
- `src/controllers/blogs.js` defines the blog API routes
- `src/controllers/authors.js` aggregates blog counts and likes by author
- `src/controllers/login.js` issues authentication tokens
- `src/controllers/users.js` defines the user API routes
- `src/models/blog.js` defines the blog model and ownership field
- `src/models/user.js` defines the user model and timestamps
- `src/models/associations.js` links users and blogs
- `src/util/db.js` configures the database connection
- `src/util/auth.js` verifies tokens and creates login tokens
- `src/util/migrate.js` applies additive schema updates
- `src/util/middleware.js` centralizes request error handling
