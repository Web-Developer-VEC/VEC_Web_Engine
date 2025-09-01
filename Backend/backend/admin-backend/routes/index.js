const express = require('express');

const router = express.Router();
// const administrationadmin = require('./administration_routes');
const galleryadmin = require('./gallery_routes');

const clubadmin = require('./club_routes');
const temp = require('./temp_routes');
const admin = require('./admin_routes');





// router.use('',administrationadmin);
router.use('',galleryadmin);
router.use('',clubadmin);
router.use('',temp);
router.use('',admin);



module.exports = router;