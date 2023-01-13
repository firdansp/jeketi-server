'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('members', 'slug');
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn('members', 'slug');    
  }
};
