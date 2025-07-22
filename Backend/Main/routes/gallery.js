const express = require('express');
const { getGalleryData } = require('../controllers/galleryController');

const router = express.Router();

router.get('/gallery', getGalleryData);

module.exports = router;