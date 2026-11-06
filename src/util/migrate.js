const { Umzug, SequelizeStorage } = require('umzug');
const sequelize = require('./db');

async function migrate() {
  const umzug = new Umzug({
    migrations: {
      glob: 'src/migrations/*.js',
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, tableName: 'migrations' }),
    logger: console,
  });

  await umzug.up();
}

module.exports = migrate;
