const express = require('express');
const router = express.Router();
const profile = require('../controllers/profile');

router.get('/:lineId', profile.getProfileSummary);

module.exports = router;