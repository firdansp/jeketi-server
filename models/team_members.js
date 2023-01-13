'use strict';
module.exports = (sequelize, DataTypes) => {
  const team_members = sequelize.define('team_members', {
    team_id: DataTypes.INTEGER,
    member_id: DataTypes.INTEGER
  }, {});
  team_members.associate = function(models) {
    // associations can be defined here
  };
  return team_members;
};