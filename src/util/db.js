const { Sequelize } = require('sequelize');

const isTesting = process.env.TESTING === 'true';
const databaseUrl = isTesting ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
if (!databaseUrl) {
  const variable = isTesting ? 'TEST_DATABASE_URL' : 'DATABASE_URL';
  throw new Error(`${variable} is not set. Configure it in your environment.`);
}

if (isTesting && process.env.DATABASE_URL) {
  const testDatabase = new URL(databaseUrl);
  const normalDatabase = new URL(process.env.DATABASE_URL);
  if (
    testDatabase.protocol === normalDatabase.protocol
    && testDatabase.hostname === normalDatabase.hostname
    && testDatabase.port === normalDatabase.port
    && testDatabase.pathname === normalDatabase.pathname
  ) {
    throw new Error('TEST_DATABASE_URL must point to a different database than DATABASE_URL.');
  }
}

const sequelize = new Sequelize(databaseUrl, { logging: console.log });

module.exports = sequelize;
