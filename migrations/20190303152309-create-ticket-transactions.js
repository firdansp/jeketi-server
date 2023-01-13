'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ticket_transactions', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      timestamp: {
        type: Sequelize.INTEGER
      },
      ticket_class: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.TEXT
      },
      payment_option: {
        type: Sequelize.STRING
      },
      ticket_type: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ticket_transactions');
  }
};