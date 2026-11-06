const app = require('./app');
const sequelize = require('./util/db');
const User = require('./models/user');

const port = process.env.PORT || 3001;

async function start() {
  try {
    await sequelize.authenticate();
    await User.sync();
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
