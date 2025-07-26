const express = require('express');
const { getAdmin } = require('../controllers/adminController');

const router = express.Router();

router.get('/adminoffice', getAdmin);

module.exports = router;