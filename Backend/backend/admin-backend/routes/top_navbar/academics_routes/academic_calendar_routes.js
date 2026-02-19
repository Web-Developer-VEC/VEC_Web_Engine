const express = require('express');

const router = express.Router();

const {handleTempAction} = require('../../../middlewares/action_handle_middleware');

const {handleTempApproval} = require('../../../middlewares/approve_middleware');

const {insertData} = require('../../../controllers/top_navbar/academics_controllers/academic_calendar_controllers/calendar_insert_controllers');
const { updateData } = require('../../../controllers/top_navbar/academics_controllers/academic_calendar_controllers/calendar_update_controllers');
const { deleteData } = require('../../../controllers/top_navbar/academics_controllers/academic_calendar_controllers/calendar_delete_controllers');
const { checkRole } = require('../../../middlewares/role_middleware');


router.post(
    '/vision_and_missionadmin',
    checkRole(["super_admin"]),
    handleTempApproval,
    handleTempAction(insertData, updateData, deleteData)
    );



module.exports = router;