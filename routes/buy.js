const express = require('express');
const router = express.Router();
const transaction = require('../controllers/transaction');

router.post('/:timestamp', transaction.buyticket);
router.get('/point/:lineId', transaction.getPoint);

module.exports = router;