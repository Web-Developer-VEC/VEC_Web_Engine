const express = require('express');
const { ensureAuthenticated } = require('../../middleware/authMiddelware');
const { getWardenDetail } = require('../../controllers/wardenController/sidebarController');

const router = express.Router();

router.get('/sidebar_warden', ensureAuthenticated, getWardenDetail);

module.exports = router;