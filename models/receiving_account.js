'use strict';
module.exports = (sequelize, DataTypes) => {
  const receiving_account = sequelize.define('receiving_account', {
    payment_method_id: DataTypes.INTEGER,
    account_number: DataTypes.STRING,
    name: DataTypes.STRING,
    active: DataTypes.BOOLEAN
  }, {});
  receiving_account.associate = function(models) {
    receiving_account.belongsTo(models.payment_method, { foreignKey: 'payment_method_id'})
  };
  return receiving_account;
};