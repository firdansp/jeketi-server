'use strict';
module.exports = (sequelize, DataTypes) => {
  const show = sequelize.define('show', {
    show_id: DataTypes.INTEGER,
    setlist_id: DataTypes.INTEGER,
    date: DataTypes.DATE,
    timestamp: DataTypes.INTEGER
  }, {});
  show.associate = function(models) {
    // associations can be defined here
  };
  return show;
};