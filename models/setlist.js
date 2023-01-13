'use strict';
module.exports = (sequelize, DataTypes) => {
  const setlist = sequelize.define('setlist', {
    setlist_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    image_url: DataTypes.STRING,
    description: DataTypes.STRING,
    active: DataTypes.BOOLEAN
  }, {});
  setlist.associate = function(models) {
    // associations can be defined here
  };
  return setlist;
};