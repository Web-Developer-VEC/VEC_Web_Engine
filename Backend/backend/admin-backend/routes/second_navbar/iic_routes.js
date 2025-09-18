
const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../middlewares/action_handle_middleware");
const { checkRole } = require("../../middlewares/role_middleware")
const {  handleTempApproval } = require("../../middlewares/approve_middleware"); 

const {insertData} = require("../../controllers/second_navbar/iic_controllers/iic_insert_controllers");
const { updateData } = require("../../controllers/second_navbar/iic_controllers/iic_update_controllers");
const { deleteData } = require("../../controllers/second_navbar/iic_controllers/iic_delete_controllers");


router.post("/iicadmin",
    checkRole(["super_admin"]),
    handleTempApproval,
    handleTempAction(insertData, updateData, deleteData), 
); 

module.exports = router;
