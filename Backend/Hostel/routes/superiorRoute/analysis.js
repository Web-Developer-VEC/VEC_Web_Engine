const express = require('express');
const { ensureAuthenticatedSuperior } = require('../../middleware/authMiddelware');
const { passMeasureSuperior, analysisSuperior, analysisSuperior_date } = require('../../controllers/superiorController/analysisController');

const router = express.Router();

router.get('/pass_measures_superior', ensureAuthenticatedSuperior, passMeasureSuperior);
router.post('/pass_analysis_superior', ensureAuthenticatedSuperior, analysisSuperior);
router.post('/pass_analysis_by_date_superior', ensureAuthenticatedSuperior, analysisSuperior_date);

module.exports = router;