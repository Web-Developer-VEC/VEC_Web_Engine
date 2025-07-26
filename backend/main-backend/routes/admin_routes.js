const express = require('express');
const { getAdmin } = require('../controllers/admin_controllers');

const router = express.Router();

router.get('/adminoffice', getAdmin);

module.exports = router;