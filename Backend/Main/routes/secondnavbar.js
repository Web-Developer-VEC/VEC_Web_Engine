const express = require('express');
const { getNaac, getNba, getNirf, getiic, getIqac } = require('../controllers/secondnavbarController');

const router = express.Router();

router.get('/naac', getNaac);
router.get('/nba', getNba);
router.get('/nirf', getNirf);
router.get('/iic', getiic);
router.get('/iqac', getIqac);

module.exports = router