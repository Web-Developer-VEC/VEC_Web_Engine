const express = require('express');

const router = express.Router();

const {handleTempAction} = require('../../../middlewares/action_handle_middleware');

const {handleTempApproval} = require('../../../middlewares/approve_middleware');

const {insertData} = require('../../../controllers/top_navbar/academics_controllers/student_achievments_controllers/student_achievments_insert_controllers');
const { updateData } = require('../../../controllers/top_navbar/academics_controllers/student_achievments_controllers/student_achievments_update_controllers');
const { deleteData } = require('../../../controllers/top_navbar/academics_controllers/student_achievments_controllers/student_achievments_delete_controllers');
const { checkRole } = require('../../../middlewares/role_middleware');


router.post(
    '/student_achievementsadmin',
    checkRole(["super_admin"]),
     handleTempApproval,
     handleTempAction(insertData, updateData, deleteData)
    );



module.exports = router;