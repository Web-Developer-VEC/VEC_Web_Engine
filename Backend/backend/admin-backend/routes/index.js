const express = require('express');

const router = express.Router();
// const administrationadmin = require('./administration_routes');
const galleryadmin = require('./gallery_routes');
const tempstore = require('./temp_routes');
const admin = require('./admin_routes');
const armyadmin = require('./club_routes/ncc_army_routes');
const navyadmin = require('./club_routes/ncc_navy_routes');
const nssadmin = require('./club_routes/nss_routes');
const yrcadmin = require('./club_routes/yrc_routes');




// router.use('',administrationadmin);
router.use('',galleryadmin);
router.use('',tempstore);
router.use('',admin);
router.use('',armyadmin);
router.use('',navyadmin);
router.use('',nssadmin);
router.use('',yrcadmin);

module.exports = router;