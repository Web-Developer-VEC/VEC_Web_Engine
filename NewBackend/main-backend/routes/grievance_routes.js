const express = require('express');
const { getGrievance } = require('../controllers/grievance_controllers');

const router = express();

router.post('/get_grevience', getGrievance);

module.exports = router;