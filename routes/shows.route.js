const express = require('express');
const router = express.Router();
const shows = require('../controllers/showController');

router.get('/', shows.getAll);
router.get('/:setList', shows.getBySetlist);
router.get('/memberlist/:showId', shows.getMembersByShow);


module.exports = router;