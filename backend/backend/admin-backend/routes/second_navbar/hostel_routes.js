const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../middlewares/action_handle_middleware"); // your single controller
const { checkRole } = require("../../middlewares/role_middleware")
const {  handleTempApproval } = require("../../middlewares/approve_middleware"); 

const { insertData } = require("../../controllers/second_navbar/hostel_controllers/hostel_insert_controller");
const { deleteData } = require("../../controllers/second_navbar/hostel_controllers/hostel_delete_controller");
const { updateData } = require("../../controllers/second_navbar/hostel_controllers/hostel_update_controller");



router.post(
  "/hosteladmin",
  checkRole(["super_admin"]), 
  handleTempApproval,
  handleTempAction( insertData, deleteData, updateData )
);

module.exports = router;

