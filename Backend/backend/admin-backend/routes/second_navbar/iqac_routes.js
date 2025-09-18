const express = require("express");
const { handleTempAction } = require("../../middlewares/action_handle_middleware");

const{handleTempApproval} = require("../../middlewares/approve_middleware");
const router = express.Router();
const {insertData} = require("../../controllers/second_navbar/iqac_controller/iqac_insert_controllers");
const { updateData } = require("../../controllers/second_navbar/iqac_controller/iqac_update_controllers");
const { deleteData } = require("../../controllers/second_navbar/iqac_controller/iqac_delete_controllers");  
const { checkRole } = require("../../middlewares/role_middleware");


router.post("/iqacadmin",
    checkRole(["super_admin"]), 
    handleTempApproval,
     handleTempAction( insertData, updateData, deleteData ));

module.exports = router;
