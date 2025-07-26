const express = require('express');
const { getOrgChart } = require('../controllers/org_chart_controllers');

const router = express.Router();

router.get('/organization_chart', getOrgChart);

module.exports = router;