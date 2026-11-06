const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');

const Session = sequelize.define(
  'Session',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'sessions',
    underscored: true,
  },
);

module.exports = Session;
