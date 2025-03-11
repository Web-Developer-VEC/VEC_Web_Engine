const express = require('express');
const { ensureAuthenticatedWarden } = require('../../middleware/authMiddelware');
const { foodChangeApprove, getFoodRequestChange, fetchOldPassWarden, wardenReject, WardenAccept, fetchPassWarden } = require('../../controllers/wardenController/requestController');

const router = express.Router();

router.get('/food_requests_changes', ensureAuthenticatedWarden, getFoodRequestChange);
router.post('/approve_food_change', ensureAuthenticatedWarden, foodChangeApprove);
router.post('/fetch_old_passes_for_warden', ensureAuthenticatedWarden, fetchOldPassWarden);
router.get('/fetch_pending_passes_warden', ensureAuthenticatedWarden, fetchPassWarden);
router.post('/warden_accept', ensureAuthenticatedWarden, WardenAccept);
router.post('/warden_not_accept', ensureAuthenticatedWarden, wardenReject);

module.exports = router;