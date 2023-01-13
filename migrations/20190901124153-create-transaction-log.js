'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('transaction_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transaction_id: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.ENUM({
          'values': ['CREATED', 'WAITING_FOR_CONFIRMATION', 'CONFIRMED', 'WAITING_FOR_PAYMENT', 'PAID', 'COMPLETED', 'EXPIRED']
        })
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('transaction_logs');
    return queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_transaction_logs_status";')
  }
};