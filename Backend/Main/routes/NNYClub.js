const express = require('express');
const { getNssData, getYrcData, getArmyData, getNavyData } = require('../controllers/NNYClubeController');

const router = express();

router.get('/ncc_army', getArmyData);
router.get('/ncc_navy', getNavyData);
router.get('/nss', getNssData);
router.get('/yrc', getYrcData);

module.exports = router;