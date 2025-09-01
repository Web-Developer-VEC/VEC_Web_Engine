const express = require('express');

const router = express.Router();
// const administrationadmin = require('./administration_routes');
const galleryadmin = require('./gallery_routes');
const transportAdmin = require('./transport_routes');
const auth = require('./admin_routes');
const temp = require('./temp_routes');




// router.use('',administrationadmin);
router.use('',galleryadmin);
router.use('', transportAdmin)
router.use('', auth);
router.use('', temp);


module.exports = router;