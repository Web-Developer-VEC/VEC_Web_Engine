
const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../middlewares/action_handle_middleware"); 

const {  handleTempApproval } = require("../../middlewares/approve_middleware"); 
const { insertData } = require("../../controllers/second_navbar/ncc_army_controllers/army_insert_controllers");
const { updateData } = require("../../controllers/second_navbar/ncc_army_controllers/army_update_controllers");
const { deleteData } = require("../../controllers/second_navbar/ncc_army_controllers/army_delete_controllers");
const { checkRole } = require("../../middlewares/role_middleware");


router.post("/armyadmin",
    checkRole(["super_admin"]),
    handleTempApproval,
    handleTempAction(insertData, updateData, deleteData)

);

module.exports = router;
