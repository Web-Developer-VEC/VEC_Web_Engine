const express = require('express');
const { getNssData, getYrcData } = require('../controllers/NNYClubeController');

const router = express();

router.get('/ncc');
router.get('/nss', getNssData);
router.get('/yrc', getYrcData);

module.exports = router;