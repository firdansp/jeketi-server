'use strict';
let transactionLog;
module.exports = (sequelize, DataTypes) => {
  transactionLog = sequelize.models.transaction_log;
  const transactions = sequelize.define('transactions', {
    trx_id: {
      type: DataTypes.STRING,
      unique: true
    },
    payment_method_id: DataTypes.INTEGER,
    payment_account_id: DataTypes.INTEGER,
    receiving_account_id: DataTypes.INTEGER,
    lineId: DataTypes.STRING,
    email: DataTypes.STRING,
    topup_url: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    subtotal: DataTypes.INTEGER,
    admin_fee: DataTypes.INTEGER,
    total: DataTypes.INTEGER,
    processing_fee: DataTypes.INTEGER,
    unique_code: DataTypes.INTEGER,
    grand_total: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM({
        'values': ['CREATED', 'WAITING_FOR_PAYMENT', 'PAYMENT_RECEIVED', 'COMPLETED', 'EXPIRED']
      })
    },
    expiredAt: DataTypes.DATE
  }, {
    hooks: {
      afterCreate: updateHistory,
      afterUpdate: updateHistory
    }
  });
  transactions.associate = function (models) {
    transactions.belongsTo(models.payment_method, { foreignKey: 'payment_method_id' })
  };
  return transactions;
};

const updateHistory = (instance, options) => {
  transactionLog.create({
    transaction_id: instance.id,
    status: instance.status
  })
}