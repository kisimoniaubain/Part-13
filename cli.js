require('dotenv').config();

const { Sequelize } = require('sequelize');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env and set your database URL.');
  }

  const sequelize = new Sequelize(databaseUrl, { logging: console.log });

  try {
    const [blogs] = await sequelize.query('SELECT * FROM blogs');
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
