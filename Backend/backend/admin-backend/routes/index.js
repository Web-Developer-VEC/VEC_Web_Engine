const express = require('express');

const router = express.Router();
// const administrationadmin = require('./administration_routes');
const galleryadmin = require('./gallery_routes');
const clubadmin = require('./club_routes');
const tempstore = require('./tempstore_routes');
const admin = require('./admin_routes');
const tempreq = require('./temprequest_routes');
const tempcomplete = require('./tempcompleted_routes');




// router.use('',administrationadmin);
router.use('',galleryadmin);
router.use('',clubadmin);
router.use('',tempstore);
router.use('',admin);
router.use('',tempreq);
router.use('',tempcomplete);

module.exports = router;