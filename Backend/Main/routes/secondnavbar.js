const express = require('express');
const { getNaac, getNba, getNirf, getiic, getIqac, getECell } = require('../controllers/secondnavbarController');

const router = express.Router();

router.get('/naac', getNaac);
router.get('/nba', getNba);
router.get('/nirf', getNirf);
router.get('/iic', getiic);
router.get('/iqac', getIqac);
router.get('/ecell', getECell);

module.exports = router;