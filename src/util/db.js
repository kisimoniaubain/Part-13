const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and set your database URL.');
}

const sequelize = new Sequelize(databaseUrl, { logging: console.log });

module.exports = sequelize;
