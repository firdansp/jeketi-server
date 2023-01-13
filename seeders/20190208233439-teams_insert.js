'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
  return queryInterface.bulkInsert('teams', [{
    name: 'J',
     createdAt: Sequelize.fn('NOW'),
     updatedAt: Sequelize.fn('NOW')
  }, {
    name: 'K3',
      createdAt: Sequelize.fn('NOW'),
      updatedAt: Sequelize.fn('NOW')
  }, {
    name: 'T',
     createdAt: Sequelize.fn('NOW'),
     updatedAt: Sequelize.fn('NOW')
  }, {
    name: 'Academy',
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW')
  }])
  },

  down: (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete('teams', {
      name: {
        [Op.in]: ['J', 'K3', 'T', 'Academy']
      }
    }, {})
  }
};
