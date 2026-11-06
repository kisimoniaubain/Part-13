const { DataTypes } = require('sequelize');

async function up({ context: queryInterface }) {
  await queryInterface.addColumn('blogs', 'year', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });
}

async function down({ context: queryInterface }) {
  await queryInterface.removeColumn('blogs', 'year');
}

module.exports = { up, down };
