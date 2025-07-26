const express = require('express');
const { ensureAuthenticatedWarden } = require('../../middleware/authMiddelware');
const { passMeasureWarden, analysisWarden, analysisWarden_date } = require('../../controllers/wardenController/analysisController');

const router = express.Router();

router.get('/pass_measures_warden', ensureAuthenticatedWarden, passMeasureWarden);
router.post('/pass_analysis_warden', ensureAuthenticatedWarden, analysisWarden);
router.post('/pass_analysis_by_date_warden', ensureAuthenticatedWarden, analysisWarden_date);

module.exports = router;