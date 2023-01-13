const {
  transactions: transaction,
  payment_method: paymentMethod,
  receiving_account: receivingAccount,
  user_cookie: cookieDB,
  payment_accounts: paymentAccount
} = require('../models');
const Models = require('../models');
const {
  notIn,
  and,
  lt,
} = require('sequelize')['Op'];
const id = require('shortid');
const MAXIMUM_UNIQUE_PRICE = process.env.MAXIMUM_UNIQUE_PRICE;
const MINIMUM_UNIQUE_PRICE = process.env.MINIMUM_UNIQUE_PRICE;
const ONE_MINUTE = 60 * 1000;
const MAXIMUM_RETRY = 100;
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta');
const REUSED_CONDITION = ['EXPIRED', 'COMPLETED'];
const topup = require('./priceScraper');
const logger = require('./logger');
const notify = require('../util/notify');
const axios = require('axios');
const {
  uuidv4
} = require('../util/uuid');

const cleanFunction = async () => {
  const NOW = moment().format('YYYY-MM-DD HH:mm:ss');
  const formattedTime = moment.tz(NOW, 'Asia/Jakarta').format();
  transaction.update({
    status: 'EXPIRED'
  }, {
    where: {
      [and]: [{
        expiredAt: {
          [lt]: formattedTime
        }
      }, {
        status: {
          [notIn]: REUSED_CONDITION
        }
      }]
    }
  })
}

const createOrder = async options => {
  if (!options) {
    throw new Error('param cannot be empty');
  } else {
    const e = new Error();
    if (options.confirm) {
      // TODO: if confirmed, fill the payment account id num
      // logger.log(options);
      await confirmTransaction(options.trx_id);
      await waitForPayment(options.trx_id);
      const {
        email
      } = await cookieDB.findByPk(options.lineId);
      const queryResult = await transaction.findOne({
        where: {
          [and]: [{
              trx_id: options.trx_id
            },
            {
              status: {
                [notIn]: REUSED_CONDITION
              }
            }
          ]
        },
        include: [{
          model: Models.payment_method,
          include: [{
            model: Models.receiving_account
          }]
        }]
      })

      const {
        trx_id,
        grand_total,
        expiredAt
      } = queryResult;
      const {
        name: paymentMethod
      } = queryResult.payment_method;
      const {
        account_number,
        name
      } = queryResult.payment_method.receiving_accounts[0];

      const result = {};
      result.type = 'WAITING_FOR_PAYMENT';
      result.data = {
        email,
        trx_id,
        grand_total,
        paymentMethod,
        account_number,
        name,
        expiry: expiredAt
      }
      // logger.log(result);
      return result;
    } else {
      if (!options.amount) {
        e.type = 'NEED_AMOUNT';
        e.data = await topup.getAvailableAmounts(options.lineId);
        throw e;
      }
      if (!options.paymentMethod) {
        e.type = 'NEED_PAYMENT_METHOD';
        e.data = await getPaymentMethods();
        throw e;
      }

      if (!options.confirm) {
        const {
          pointsConfirmation,
          profileDetail,
          trx_id
        } = await getQuotation(options);
        e.type = 'WAITING_FOR_CONFIRMATION';
        e.data = {
          trx_id,
          topupConfirmation: pointsConfirmation,
          profileDetail
        }
      }
      logger.error = e;
      // logger.log(options);
      throw e;
    }
  }
}

const waitForPayment = async trx_id => {
  const status = 'WAITING_FOR_PAYMENT';
  return transaction.update({
    status
  }, {
    where: {
      [and]: [{
          trx_id
        },
        {
          status: {
            [notIn]: REUSED_CONDITION
          }
        }
      ]
    }
  });
}

const confirmTransaction = trx_id => {
  const status = 'CONFIRMED';
  return transaction.update({
    status
  }, {
    where: {
      [and]: [{
          trx_id
        },
        {
          status: {
            [notIn]: REUSED_CONDITION
          }
        }
      ]
    }
  });
}

const getQuotation = async options => {
  let {
    paymentMethod: name,
    lineId,
    amount: amountPoint
  } = options;
  const {
    email
  } = cookieDB.findByPk(lineId);

  let paymentDetail;
  let topupLink = '';
  if (amountPoint) {
    amount = await topup.verifyPoints(lineId, amountPoint);
    paymentDetail = await topup.getPaymentDetail(lineId, amount);
    topupLink = paymentDetail.topupLink;
  }


  const {
    pointsConfirmation = '',
      profileDetail = ''
  } = paymentDetail.confirmation;
  const admin_fee = pointsConfirmation['Biaya Administrasi'].split(' ')[1].split(',').join('');

  const receivingAccounts = await receivingAccount.findAll({
    include: [{
      model: paymentMethod,
      where: {
        [and]: [{
          name
        }, {
          status: true
        }]
      }
    }]
  });

  const receivingAccountIndex = Math.floor(Math.random() * receivingAccounts.length);
  const receivingPaymentAccount = receivingAccounts[receivingAccountIndex];


  const detailPayment = await getPaymentDetail(amount, admin_fee, receivingPaymentAccount.payment_method.processing_fee);
  const status = 'WAITING_FOR_CONFIRMATION';
  const trx_id = await getUniqueTransactionId();

  const quotation = await transaction.findOne({
    where: {
      [and]: [{
          trx_id
        },
        {
          status: {
            [notIn]: REUSED_CONDITION
          }
        }
      ]
    }
  });

  const {
    subtotal,
    total,
    unique_code,
    grand_total,
    processing_fee
  } = detailPayment;

  const expiredAt = moment().add(60, 'minute').format('YYYY-MM-DD HH:mm:ss');
  const formattedTime = moment.tz(expiredAt, 'Asia/Jakarta').format();

  console.log("====================");
  console.log(topupLink);
  console.log("====================");

  const updatedData = await quotation.update({
    payment_method_id: Number(receivingPaymentAccount.payment_method.id),
    payment_account_id: null,
    receiving_account_id: Number(receivingPaymentAccount.id),
    lineId,
    email,
    subtotal, // jumlah yang dibeli
    admin_fee, // MDR
    total, // total dari website jeketi
    processing_fee, // processing fee
    unique_code, // unique code
    grand_total, // total semua
    status,
    topup_url: topupLink,
    expiredAt: formattedTime
  })

  pointsConfirmation['Kode Unik'] = unique_code;
  pointsConfirmation['Handling Fee'] = processing_fee;
  pointsConfirmation['Total Pembayaran'] = grand_total;
  pointsConfirmation['Cara Pembayaran'] = name;
  return {
    pointsConfirmation,
    profileDetail,
    trx_id
  };
}

const getPaymentDetail = async (amount, admin_fee, processing_fee, attempt = 0) => {
  if (attempt === MAXIMUM_RETRY) {
    throw new Error(`Error while getting payment detail after 100 times`)
  }
  const subtotal = Number(amount);
  const total = Number(subtotal) + Number(admin_fee);
  const unique_code = Math.floor(Math.random() * (MAXIMUM_UNIQUE_PRICE - MINIMUM_UNIQUE_PRICE + 1)) + MINIMUM_UNIQUE_PRICE;
  const grand_total = Number(total) + Number(processing_fee) + Number(unique_code);

  const duplicate = await transaction.findOne({
    where: {
      [and]: [{
          grand_total
        },
        {
          status: {
            [notIn]: REUSED_CONDITION
          }
        }
      ]
    }
  })
  if (duplicate) {
    getPaymentDetail(amount, processing_fee, attempt + 1)
  } else {
    return {
      subtotal,
      admin_fee,
      total,
      unique_code,
      grand_total,
      processing_fee
    };
  }
}

const getUniqueTransactionId = async (attempt = 0) => {
  if (attempt === MAXIMUM_RETRY) {
    throw new Error(`Error while getting unique transaction id after 100 times`)
  }
  const trx_id = id.generate();
  const duplicate = await transaction.findOne({
    where: {
      [and]: [{
          trx_id
        },
        {
          status: {
            [notIn]: REUSED_CONDITION
          }
        }
      ]
    }
  });

  if (duplicate) {
    return getUniqueTransactionId(attempt + 1);
  } else {
    const result = await transaction.create({
      trx_id,
      status: 'CREATED'
    });
    return result.trx_id;
  }
}

const sleep = timeout => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve()
    }, timeout)
  })
}

const getPaymentMethods = async () => {
  const queryResult = await paymentMethod.findAll({
    where: {
      status: true
    }
  });
  const paymentMethods = queryResult.map(row => {
    return row.name
  })
  return paymentMethods
}

const confirmPayment = async paymentDetails => {
  try {
    const {
      amount
    } = paymentDetails;

    const transactionQuery = await transaction.findOne({
      where: {
        [and]: [{
            grand_total: amount
          },
          {
            status: {
              [notIn]: REUSED_CONDITION
            }
          }
        ]
      }
    });

    await notify({
      to: transactionQuery.lineId,
      message: `Pembayaran sebesar Rp ${amount} untuk kode transaksi ${transactionQuery.trx_id} telah diterima. Sesaat lagi kami akan mengirimkan notifikasi status transaksi top up anda`
    })

    const paymentMethods = await paymentAccount.findAll({
      where: {
        active: true
      }
    });

    const paymentCardIndex = Math.floor(Math.random() * paymentMethods.length);
    const paymentCard = paymentMethods[paymentCardIndex];
    const {
      no: num,
      cvv,
      expiry
    } = paymentCard;
    const {
      topup_url: link
    } = transactionQuery;

    if (transactionQuery) {
      await transactionQuery.update({
        status: 'PAID',
        payment_account_id: paymentCardIndex
      })
    }

    const POLLING_STOP_CONDITION = (response) => {
      return [
        'SUCCESS',
        'FAILED',
        'WAITING_FOR_OTP'
      ].indexOf(response.data.status) > -1;
    }

    const job_id = uuidv4();
    const service = 'MIDTRANS';

    const paymentRequest = axios.post.bind(axios.post, process.env.TOPUP_SERVICE_URL, {
      job_id,
      service,
      data: {
        link,
        num,
        cvv,
        expiry
      }
    });

    const response = await retryPromise(paymentRequest, POLLING_STOP_CONDITION, 2000);
    if (response.data.status === 'WAITING_FOR_OTP') {
      await sleep(20000);
      const messages = await axios.get(process.env.SMS_SERVICE_URL, {
        headers: {
          'x-api-key': process.env.API_KEY
        }
      });

      const msgstring = await messages.data.find(e => e.content.includes('BTPN'));
      const split = msgstring.content.split('is ');
      const otp = split[1].slice(0, 6);


      const submitOtp = axios.post.bind(axios.post, process.env.TOPUP_SERVICE_URL, {
        job_id,
        service,
        data: {
          link,
          num,
          cvv,
          expiry,
          otp
        }
      }, {
        headers: {
          'x-api-key': process.env.API_KEY
        }
      });

      const result = await retryPromise(submitOtp, POLLING_STOP_CONDITION, 2000);

      if (result) {
        await notify({
          to: transactionQuery.lineId,
          message: `Transaksi top up dengan kode transaksi ${transactionQuery.trx_id} berhasil. Silakan cek JKT48 points anda melalui perintah /mypage`
        });
        await transaction.update({
          status: 'Completed'
        }, {
          where: {
            [and]: [{
                trx_id
              },
              {
                status: {
                  [notIn]: REUSED_CONDITION
                }
              }
            ]
          }
        })
      }
    }



  } catch (e) {
    console.error(e);
    // send to elasticsearch
    console.log("error in service, function confirmPayment")
  }
}

const cleaner = setInterval(cleanFunction, ONE_MINUTE);

const retryPromise = (fn, stopCondition, retryInterval) => {
  console.log('retrying....')
  return fn()
    .then(data => {
      if (stopCondition(data)) {
        return data;
      }

      return new Promise(resolve => {
        retryInterval = retryInterval || 1000;
        setTimeout(function () {
          resolve(retryPromise(fn, stopCondition, retryInterval));
        }, retryInterval);
      });
    });
}

(cleanFunction)()

module.exports = {
  createOrder,
  confirmPayment
}