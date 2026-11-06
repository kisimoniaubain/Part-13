const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');

let User;

User = sequelize.define(
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
      unique: {
        name: 'users_username_unique',
        msg: 'username must be unique',
      },
      validate: {
        notBlank(value) {
          if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Username must not be empty');
          }
        },
        isEmail: {
          msg: 'username must be a valid email address',
        },
        async isUnique(value) {
          const existingUser = await User.findOne({
            where: { username: value },
            attributes: ['id'],
          });
          if (existingUser) {
            throw new Error('username must be unique');
          }
        },
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    defaultScope: {
      attributes: { exclude: ['passwordHash'] },
    },
  },
);

module.exports = User;
