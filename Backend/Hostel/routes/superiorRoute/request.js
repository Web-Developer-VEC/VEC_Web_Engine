const express = require('express');
const { ensureAuthenticatedSuperior } = require('../../middleware/authMiddelware');
const { profileChangeRequestSuperior, profileUpdate, fetchPassSuperior, superiorAccept, superiordecline, getOldPassSuperior, getVacateFormRequest, confirmVacate } = require('../../controllers/superiorController/requestController');

const router = express.Router();

router.get('/profile_request_changes', ensureAuthenticatedSuperior, profileChangeRequestSuperior);
router.post('/handle_request', ensureAuthenticatedSuperior, profileUpdate);
router.get('/fetch_passes_for_superior', ensureAuthenticatedSuperior, fetchPassSuperior);
router.post('/superior_accept', ensureAuthenticatedSuperior, superiorAccept);
router.post('/superior_decline', ensureAuthenticatedSuperior, superiordecline);
router.post('/fetch_old_passes_for_superior', ensureAuthenticatedSuperior, getOldPassSuperior);
router.get('/get_all_vacate_forms', ensureAuthenticatedSuperior, getVacateFormRequest);
router.post('/archive_student', ensureAuthenticatedSuperior, confirmVacate);

module.exports = router;