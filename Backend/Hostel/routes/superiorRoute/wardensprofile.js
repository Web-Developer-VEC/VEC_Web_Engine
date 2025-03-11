const express = require('express');
const { ensureAuthenticatedSuperior } = require('../../middleware/authMiddelware');
const { wardenDoInactive, wardenDoActive, addWarden, updatewarden, fetchDetailsForReallocation, getWardenDetails, fetchWardensLog } = require('../../controllers/superiorController/wardenProfileController');
const upload = require('../../middleware/uploadMiddleware');

const router = express.Router();

router.get('/fetch_warden_details', ensureAuthenticatedSuperior, getWardenDetails);
router.post('/warden_inactive_status_handling', ensureAuthenticatedSuperior, wardenDoInactive);
router.post('/warden_active_status_handling', ensureAuthenticatedSuperior, wardenDoActive);
router.post('/add_warden', upload.single('wardenImage'), ensureAuthenticatedSuperior, addWarden);
router.post('/update_warden_by_superior', upload.single('wardenImage'), ensureAuthenticatedSuperior, updatewarden);
router.post('/fetch_warden_details_reallocation', ensureAuthenticatedSuperior, fetchDetailsForReallocation);
router.get('/fetch_logs', ensureAuthenticatedSuperior, fetchWardensLog);

module.exports = router;