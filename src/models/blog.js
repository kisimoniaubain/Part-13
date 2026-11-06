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
