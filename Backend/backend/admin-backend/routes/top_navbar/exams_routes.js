const express = require('express');

const router = express.Router();

const {handleTempAction} = require('../../middlewares/action_handle_middleware');

const {handleTempApproval} = require('../../middlewares/approve_middleware');
const { insertData } = require('../../controllers/top_navbar/exams_controllers/exams_insert_controllers');
const { updatedData } = require('../../controllers/top_navbar/exams_controllers/exams_update_controllers');
const { deleteData } = require('../../controllers/top_navbar/exams_controllers/exams_delete_controllers');
const { checkRole } = require('../../middlewares/role_middleware');


router.post('/examsadmin',
    checkRole(["super_admin"]),
    handleTempApproval,
    handleTempAction(insertData, updatedData, deleteData));


module.exports = router;