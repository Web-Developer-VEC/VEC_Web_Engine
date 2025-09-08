const express = require("express");
const { handleTempAction } = require("../../controllers/second_navbar/help_desk_contollers/help_desk_handle_controllers");
const {checkRole} = require("../../middlewares/role_middleware")
const{handleTempApproval} = require("../../middlewares/approve_middleware");
const router = express.Router();

router.post(
  "/helpdeskadmin",
  checkRole(["super_admin"]), 
  handleTempApproval,
  handleTempAction
);

module.exports = router;
