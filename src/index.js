const app = require('./app');
const sequelize = require('./util/db');
const migrate = require('./util/migrate');

const port = process.env.PORT || 3001;

async function start() {
  try {
    await sequelize.authenticate();
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set. Add a secret to your .env file.');
    }
    await migrate();
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    await sequelize.close();
    process.exitCode = 1;
    return;
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start();
