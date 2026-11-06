const sequelize = require('./db');
const Blog = require('../models/blog');
const User = require('../models/user');

async function migrate() {
  const queryInterface = sequelize.getQueryInterface();

  await User.sync();
  await Blog.sync();

  const userColumns = await queryInterface.describeTable('users');
  if (!userColumns.passwordHash) {
    await queryInterface.addColumn('users', 'passwordHash', {
      type: User.rawAttributes.passwordHash.type,
      allowNull: true,
    });
  }

  const blogColumns = await queryInterface.describeTable('blogs');
  if (!blogColumns.userId) {
    await queryInterface.addColumn('blogs', 'userId', {
      type: Blog.rawAttributes.userId.type,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  }
}

module.exports = migrate;
