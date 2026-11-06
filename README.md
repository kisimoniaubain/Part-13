# Part 13

Exercises for the Full Stack Open relational databases course.

## Database

The local development database runs in Docker. To connect with `psql`:

```powershell
docker exec -it blog-db psql -U postgres -d blogapp
```

## Running the blog CLI

Install dependencies with `npm install`. Copy `.env.example` to `.env` and set
`DATABASE_URL` to your local PostgreSQL connection string, then run:

```powershell
npm start
```
