const express = require('express');

const router = express.Router();

const {handleTempAction} = require('../../../middlewares/action_handle_middleware');

const {handleTempApproval} = require('../../../middlewares/approve_middleware');

const { updateData } = require('../../../controllers/top_navbar/academics_controllers/sideBarController');
const { checkRole } = require('../../../middlewares/role_middleware');


router.post(
    '/sidebaradmin',
    checkRole(["super_admin"]),
    handleTempApproval,
    handleTempAction(null, updateData, null)
    );



module.exports = router;