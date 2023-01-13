'use strict';
module.exports = (sequelize, DataTypes) => {
  const show_history = sequelize.define('show_history', {
    show_history_id: DataTypes.INTEGER,
    member_id: DataTypes.INTEGER,
    show_id: DataTypes.INTEGER
  }, {});
  show_history.associate = function(models) {
    // associations can be defined here
  };
  return show_history;
};