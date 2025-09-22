const express = require('express');

const router = express.Router();

const {handleTempAction} = require('../../../middlewares/action_handle_middleware');

const {handleTempApproval} = require('../../../middlewares/approve_middleware');

const {insertData} = require('../../../controllers/top_navbar/academics_controllers/research_controllers/research_insert_controllers');
const { updateData } = require('../../../controllers/top_navbar/academics_controllers/research_controllers/research_update_controllers');
const { deleteData } = require('../../../controllers/top_navbar/academics_controllers/research_controllers/research_delete_controllers');
const { checkRole } = require('../../../middlewares/role_middleware');


router.post(
    '/deptresearchadmin',
     checkRole(["super_admin"]),
     handleTempApproval,
     handleTempAction(insertData, updateData, deleteData)
    );



module.exports = router;