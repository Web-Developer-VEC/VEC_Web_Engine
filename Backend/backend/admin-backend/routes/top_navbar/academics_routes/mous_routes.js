const express = require('express');

const router = express.Router();

const {handleTempAction} = require('../../../middlewares/action_handle_middleware');
const { checkRole} = require("../../../middlewares/role_middleware");
const {handleTempApproval} = require('../../../middlewares/approve_middleware');
const { insertData } = require('../../../controllers/top_navbar/academics_controllers/mous_controllers/mous_insert_controller');
const { updateData } = require('../../../controllers/top_navbar/academics_controllers/mous_controllers/mous_update_controller');
const { deleteData } = require('../../../controllers/top_navbar/academics_controllers/mous_controllers/mous_delete_controller');



router.post('/mousadmin',
    checkRole(["mous_admin","super_admin"]),
    handleTempApproval, 
    handleTempAction(insertData, updateData, deleteData)
    );


module.exports = router;