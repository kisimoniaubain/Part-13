const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');

const ReadingList = sequelize.define(
  'ReadingList',
  {
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    blogId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'reading_lists',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'blog_id'],
      },
    ],
  },
);

module.exports = ReadingList;
