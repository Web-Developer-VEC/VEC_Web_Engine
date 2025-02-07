const express = require('express');
const { getAnnouncement, getSpecialAnnouncement } = require("../controllers/announcementsController");

const router = express.Router();

router.get('/announcements', getAnnouncement);
router.get('/specialannouncements', getSpecialAnnouncement);

module.exports = router;