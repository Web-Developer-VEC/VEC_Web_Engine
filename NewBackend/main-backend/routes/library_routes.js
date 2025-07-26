const express = require('express');
const { getLibraryData } = require('../controllers/library_controllers');

const router = express();

router.get('/library', getLibraryData);


module.exports = router