CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  author TEXT,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  likes INTEGER DEFAULT 0
);

INSERT INTO blogs (author, url, title)
VALUES
  ('Sample Author', 'https://example.com/blog/relational-data', 'Getting Started with Relational Data'),
  ('Another Author', 'https://example.com/blog/postgres-basics', 'PostgreSQL Basics');
