const express = require('express');

const router = express.Router();

const {handleTempAction} = require('../../../middlewares/action_handle_middleware');

const {handleTempApproval} = require('../../../middlewares/approve_middleware');

const { updateData } = require('../../../controllers/top_navbar/academics_controllers/hod_controllers/hod_update_controllers');
const { checkRole } = require('../../../middlewares/role_middleware');



router.post(
    '/hodadmin',
    checkRole(["super_admin"]),
    handleTempApproval,
    handleTempAction(updateData),   
    );



module.exports = router;