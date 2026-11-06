const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');

const User = sequelize.define(
  'User',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notBlank(value) {
          if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Name must not be empty');
          }
        },
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notBlank(value) {
          if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Username must not be empty');
          }
        },
      },
    },
  },
  {
    tableName: 'users',
  },
);

module.exports = User;
