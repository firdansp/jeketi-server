'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('members', ['name'], {
      type: 'UNIQUE',
      name: 'UNIQUE_NAME_CONSTRAINTS'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('members', 'UNIQUE_NAME_CONSTRAINTS')
  }
};
