const express = require('express');

const router = express.Router();
//Action routes 

const admin = require('./admin_routes');
const tempstore = require('./temp_routes');
const admintemp= require('./admin_temp_routes')

//Main pages
const landingadmin= require('./landing_page_routes')

//Top Nav bar
const researchadmin = require('../top_navbar/research_routes');
const examadmin = require('../top_navbar/exams_routes');
const placementadmin = require("../top_navbar/placement_routes");
const aboutusadmin = require('../top_navbar/about_us_routes');
const admissionadmin = require('../top_navbar/admission_routes')
const administrationadmin = require('../top_navbar/administration_routes')

//Second Nav Bar
const transportadmin = require('../second_navbar/transport_routes');
const otherfacilitiesadmin = require('../second_navbar/other_facilities_routes')
const galleryadmin = require('../second_navbar/gallery_routes');
const helpdeskadmin = require('../second_navbar/help_desk_routes');
const hosteladmin = require('../second_navbar/hostel_routes');
const ecelladmin = require('../second_navbar/ecell_routes');
const iicadmin = require('../second_navbar/iic_routes');
const libraryadmin = require('../second_navbar/library_routes')
const nccnavyadmin = require('../second_navbar/ncc_navy_routes')
const nccarmyadmin = require('../second_navbar/ncc_army_routes')
const nssadmin = require('../second_navbar/nss_routes')
const yrcadmin = require('../second_navbar/yrc_routes')
const iqacadmin = require('../second_navbar/iqac_routes')



//Action routes 
router.use('',tempstore);
router.use('',admin);
router.use('',admintemp);


//Main pages
router.use('',landingadmin)

//Top Nav bar
router.use('',researchadmin);
router.use('',examadmin);
router.use('',placementadmin);
router.use('',aboutusadmin);
router.use('',admissionadmin);

//Second Nav Bar
router.use('',nccnavyadmin)
router.use('',nccarmyadmin)
router.use('',nssadmin)
router.use('',yrcadmin)
router.use('',libraryadmin);
router.use('',ecelladmin);
router.use('',iicadmin);
router.use('',hosteladmin);
router.use('',transportadmin);
router.use('',otherfacilitiesadmin);
router.use('',galleryadmin);
router.use('',helpdeskadmin);



module.exports = router;