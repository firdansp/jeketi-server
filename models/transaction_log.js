'use strict';
module.exports = (sequelize, DataTypes) => {
  const transaction_log = sequelize.define('transaction_log', {
    transaction_id: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM({
        'values': ['CREATED', 'WAITING_FOR_PAYMENT', 'PAYMENT_RECEIVED', 'COMPLETED', 'EXPIRED']
      })
    }
  }, {});
  transaction_log.associate = function(models) {
    // associations can be defined here
  };
  return transaction_log;
};