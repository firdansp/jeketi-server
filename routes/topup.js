const express = require('express');
const router = express.Router();
const topup = require('../controllers/topup');
const verify = require('../helpers/verify');

router.post('/', topup.createOrder);
router.post('/notify-payment', verify, topup.paymentReceiver);

module.exports = router;