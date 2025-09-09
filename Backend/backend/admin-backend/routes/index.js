const express = require('express');

const router = express.Router();
// const administrationadmin = require('./administration_routes');
const galleryadmin = require('./second_navbar/gallery_routes');
const helpdeskadmin = require('./second_navbar/help_desk_routes');
const tempstore = require('./temp_routes');
const admin = require('./admin_routes');
const armyadmin = require('./second_navbar/ncc_army_routes');
const navyadmin = require('./second_navbar/ncc_navy_routes');
const nssadmin = require('./second_navbar/nss_routes');
const yrcadmin = require('./second_navbar/yrc_routes');




// router.use('',administrationadmin);
router.use('',galleryadmin);
router.use('',helpdeskadmin);
router.use('',tempstore);
router.use('',admin);
router.use('',armyadmin);
router.use('',navyadmin);
router.use('',nssadmin);
router.use('',yrcadmin);

module.exports = router;