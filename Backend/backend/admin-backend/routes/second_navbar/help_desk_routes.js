const express = require("express");
const { handleTempAction } = require("../../middlewares/action_handle_middleware"); 
const {checkRole} = require("../../middlewares/role_middleware")
const{handleTempApproval} = require("../../middlewares/approve_middleware");

const { updateData } = require("../../controllers/second_navbar/help_desk_contollers/help_desk_update_controllers");

const router = express.Router();

router.post(
  "/helpdeskadmin",
  checkRole(["super_admin"]), 
  handleTempApproval,
  handleTempAction( updateData )
);

module.exports = router;
