const express = require('express');
const { getOverallResearchData } = require('../controllers/overallResearchController');

const router = express();

router.post('/get_research_data', getOverallResearchData);

module.exports = router;