'use strict';
module.exports = (sequelize, DataTypes) => {
  const payment_accounts = sequelize.define('payment_accounts', {
    no: DataTypes.STRING,
    expiry: DataTypes.STRING,
    cvv: DataTypes.STRING,
    active: DataTypes.BOOLEAN
  }, {});
  payment_accounts.associate = function(models) {
    // associations can be defined here
  };
  return payment_accounts;
};