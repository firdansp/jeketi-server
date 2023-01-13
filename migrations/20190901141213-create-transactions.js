'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      trx_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      payment_method_id: {
        type: Sequelize.INTEGER
      },
      payment_account_id: {
        type: Sequelize.INTEGER
      },
      receiving_account_id: {
        type: Sequelize.INTEGER
      },
      lineId: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.INTEGER
      },
      subtotal: {
        type: Sequelize.INTEGER
      },
      admin_fee: {
        type: Sequelize.INTEGER
      },
      total: {
        type: Sequelize.INTEGER
      },
      processing_fee: {
        type: Sequelize.INTEGER
      },
      unique_code: {
        type: Sequelize.INTEGER
      },
      grand_total: {
        type: Sequelize.INTEGER
      },
      topup_url: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM({
          'values': ['CREATED', 'WAITING_FOR_CONFIRMATION', 'CONFIRMED', 'WAITING_FOR_PAYMENT', 'PAID', 'COMPLETED', 'EXPIRED']
        })
      },
      expiredAt: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('transactions');
    return queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_transactions_status";')
  }
};