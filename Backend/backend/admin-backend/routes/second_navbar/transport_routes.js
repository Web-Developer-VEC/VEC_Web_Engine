const express = require("express");
const { handleTempAction } = require("../../middlewares/action_handle_middleware"); 
const { checkRole } = require("../../middlewares/role_middleware");
const { handleTempApproval } = require("../../middlewares/approve_middleware");
const router = express.Router();

const { updateData } = require("../../controllers/second_navbar/transport_controllers/transport_update_controller");

// PDF upload + update
router.post(
  "/transportadmin",
  checkRole(["super_admin"]),
  handleTempApproval,
  handleTempAction( updateData )
);

module.exports = router;
