require('dotenv').config();

const Blog = require('./models/blog');
const sequelize = require('./util/db');

async function main() {
  try {
    const blogs = await Blog.findAll();
    blogs.forEach(({ author, title, likes }) => {
      console.log(`${author}: '${title}', ${likes} likes`);
    });
  } finally {
    await sequelize.close();
  }
}

main().catch((error) => {
  console.error('Failed to fetch blogs:', error.message);
  process.exitCode = 1;
});
