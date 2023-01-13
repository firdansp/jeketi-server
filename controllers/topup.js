const orderService = require('../services/order');

const createOrder = async (req, res) => {
 try {
   const {options} = req.body;
   const resp = await orderService.createOrder(options);
   res.send(resp);
 } catch (e) {
   console.error(e);
  //  send to logger
  const errorTypes = ['NEED_AMOUNT', 'NEED_PAYMENT_METHOD', 'WAITING_FOR_CONFIRMATION'];
  if (errorTypes.includes(e.type)) {
    res.status(400).send(e);
  } else {
    res.status(500).send(e);
  }
 }
}

const paymentReceiver = async (req, res) => {
  try {
    orderService.confirmPayment(req.body);
    res.status(401).send();
  } catch (e) {
    // log to elastic
    console.error(e);
    console.log("error in controller")
  }
}

module.exports = {
  createOrder,
  paymentReceiver
};