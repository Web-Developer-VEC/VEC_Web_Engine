const express = require('express');

const router = express.Router();

const {handleTempAction} = require('../../middlewares/action_handle_middleware');

const {handleTempApproval} = require('../../middlewares/approve_middleware');

const {insertData} = require('../../controllers/top_navbar/about_us_controllers/about_us_insert_controllers');
const { updatedData } = require('../../controllers/top_navbar/about_us_controllers/about_us_update_controllers');
const { deleteData } = require('../../controllers/top_navbar/about_us_controllers/about_us_delete_controllers');
const { checkRole } = require('../../middlewares/role_middleware');


router.post(
    '/aboutusadmin',
     checkRole(["super_admin"]),
     handleTempApproval,
     handleTempAction(insertData, updatedData, deleteData)
    );



module.exports = router;