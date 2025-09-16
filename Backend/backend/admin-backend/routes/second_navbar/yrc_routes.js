
const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../middlewares/action_handle_middleware"); // your single controller

const {  handleTempApproval } = require("../../middlewares/approve_middleware");


const { insertData } = require("../../controllers/second_navbar/yrc_controllers/yrc_insert_controllers");
const { updateData } = require("../../controllers/second_navbar/yrc_controllers/yrc_update_controllers");
const { deleteData } = require("../../controllers/second_navbar/yrc_controllers/yrc_delete_controllers");
const { checkRole } = require("../../middlewares/role_middleware");

router.post("/yrcadmin",
    checkRole(["super_admin"]),
    handleTempApproval,
    handleTempAction(insertData, updateData, deleteData));

module.exports = router;
