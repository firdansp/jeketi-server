'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('members', 'datastore_id', {
      type: Sequelize.STRING
    })
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('members', 'datastore_id', {
      type: Sequelize.STRING
    })
  }
};
