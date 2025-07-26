const express = require('express');
const { getGalleryData } = require('../controllers/gallery_controllers');

const router = express.Router();

router.get('/gallery', getGalleryData);

module.exports = router;