const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../controllers/second_navbar/hostel_controllers/hostel_handle_controller"); // your single controller
const { checkRole } = require("../../middlewares/role_middleware")
const {  handleTempApproval } = require("../../middlewares/approve_middleware"); 



router.post(
  "/hosteladmin",
  checkRole(["hostel_admin"]), 
  handleTempApproval,
  handleTempAction
);

module.exports = router;

