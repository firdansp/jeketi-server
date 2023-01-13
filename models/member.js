'use strict';
module.exports = (sequelize, DataTypes) => {
  const member = sequelize.define('member', {
    name: {
      type: DataTypes.STRING,
      unique: true
    },
    team: DataTypes.STRING,
    image_url: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    datastore_id: DataTypes.STRING
  }, {});
  member.associate = function(models) {
    // associations can be defined here
  };
  return member;
};