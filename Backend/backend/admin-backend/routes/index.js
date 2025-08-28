const express = require('express');

const router = express.Router();
// const administrationadmin = require('./administration_routes');
const galleryadmin = require('./gallery_routes');
const transportAdmin = require('./transport_routes');




// router.use('',administrationadmin);
router.use('',galleryadmin);
router.use('', transportAdmin)


module.exports = router;