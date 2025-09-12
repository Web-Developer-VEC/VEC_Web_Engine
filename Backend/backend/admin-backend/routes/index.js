const express = require('express');

const router = express.Router();
// const administrationadmin = require('./administration_routes');
const transportadmin = require('./second_navbar/transport_routes');
const otherfacilitiesadmin = require('./second_navbar/other_facilities_routes')
const galleryadmin = require('./second_navbar/gallery_routes');
const helpdeskadmin = require('./second_navbar/help_desk_routes');
const hosteladmin = require('./second_navbar/hostel_routes');
const tempstore = require('./temp_routes');
const admin = require('./admin_routes');
const ecelladmin = require('./second_navbar/ecell_routes');
const iicadmin = require('./second_navbar/iic_routes');
const researchadmin = require('./top_navbar/research_routes');
const libraryadmin = require('./second_navbar/library_routes')

// router.use('',administrationadmin);
router.use('',libraryadmin);
router.use('',ecelladmin);
router.use('',iicadmin);
router.use('',researchadmin);
router.use('',hosteladmin);
router.use('',transportadmin);
router.use('',otherfacilitiesadmin);
router.use('',galleryadmin);
router.use('',helpdeskadmin);
router.use('',tempstore);
router.use('',admin);


module.exports = router;