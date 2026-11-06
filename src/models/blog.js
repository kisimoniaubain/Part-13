const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');

const Blog = sequelize.define(
  'Blog',
  {
    author: DataTypes.STRING,
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInteger(value) {
          if (value !== null && value !== undefined && !Number.isInteger(value)) {
            throw new Error('year must be an integer');
          }
        },
        min: {
          args: [1991],
          msg: 'year must be at least 1991',
        },
        max: {
          args: [new Date().getFullYear()],
          msg: `year must not be greater than ${new Date().getFullYear()}`,
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'blogs',
    underscored: true,
  },
);

module.exports = Blog;
