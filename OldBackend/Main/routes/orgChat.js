const express = require('express');
const { getOrgChart } = require('../controllers/orgChartController');

const router = express.Router();

router.get('/organization_chart', getOrgChart);

module.exports = router;