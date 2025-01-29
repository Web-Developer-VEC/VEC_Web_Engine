const express = require('express');
const { getNaac, getNba, getNirf } = require('../controllers/secondnavbarController');

const router = express.Router();

router.get('/naac', getNaac);
router.get('/nba', getNba);
router.get('/nirf', getNirf);

module.exports = router