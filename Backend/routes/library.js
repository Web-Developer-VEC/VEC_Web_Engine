const express = require('express');
const { getLibraryData } = require('../controllers/libraryController');

const router = express();

router.get('/library', getLibraryData);


module.exports = router