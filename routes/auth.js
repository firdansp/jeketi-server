const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth');

router.get('/login/:lineId', auth.checkLogin);
router.post('/login/:lineId', auth.login);
router.post('/logout/:lineId', auth.logout);

module.exports = router;