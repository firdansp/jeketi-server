'use strict';
module.exports = (sequelize, DataTypes) => {
  const user_cookie = sequelize.define('user_cookie', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    cookie: DataTypes.TEXT,
    email: DataTypes.TEXT
  }, {});
  user_cookie.associate = function(models) {
    // associations can be defined here
  };
  return user_cookie;
};