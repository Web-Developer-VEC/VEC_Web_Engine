const express = require('express');
const { getGrievance } = require('../controllers/grievanceController');

const router = express();

router.post('/get_grevience', getGrievance);

module.exports = router;