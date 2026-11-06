# Part 13

Exercises for the Full Stack Open relational databases course.

## Database

The local development database runs in Docker. To connect with `psql`:

```powershell
docker exec -it blog-db psql -U postgres -d blogapp
```

## Running the blog backend

Install dependencies with `npm install`. Copy `.env.example` to `.env` and set
`DATABASE_URL` to your local PostgreSQL connection string, then run:

```powershell
npm start
```

The API is available at `http://localhost:3001/api/blogs`:

- `GET /api/blogs` lists blogs
- `POST /api/blogs` creates a blog
- `PUT /api/blogs/:id` updates a blog's likes (JSON body: `{"likes": 3}`)
- `DELETE /api/blogs/:id` deletes a blog by id

Run `node src/cli.js` to print the blogs in the console.

## Project structure

- `src/index.js` starts the server
- `src/app.js` configures the Express application
- `src/controllers/blogs.js` defines the blog API routes
- `src/models/blog.js` defines the blog model
- `src/util/db.js` configures the database connection
- `src/util/middleware.js` handles request errors
