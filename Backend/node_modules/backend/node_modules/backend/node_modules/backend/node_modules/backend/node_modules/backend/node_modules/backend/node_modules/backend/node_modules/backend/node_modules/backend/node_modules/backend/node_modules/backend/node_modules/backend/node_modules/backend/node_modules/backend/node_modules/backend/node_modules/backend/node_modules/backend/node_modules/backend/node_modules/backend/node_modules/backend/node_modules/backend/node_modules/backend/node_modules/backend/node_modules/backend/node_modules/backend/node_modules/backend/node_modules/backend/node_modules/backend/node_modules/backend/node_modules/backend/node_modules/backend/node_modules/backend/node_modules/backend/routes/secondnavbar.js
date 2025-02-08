const express = require('express');
const { getNaac, getNba, getNirf, getiic } = require('../controllers/secondnavbarController');

const router = express.Router();

router.get('/naac', getNaac);
router.get('/nba', getNba);
router.get('/nirf', getNirf);
router.get('/iic', getiic)

module.exports = router