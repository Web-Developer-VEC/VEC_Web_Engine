const express = require("express");
const { handleTempAction } = require("../../controllers/second_navbar/transport_controllers/transport_handle_controller");
const { checkRole } = require("../../middlewares/role_middleware");
const { handleTempApproval } = require("../../middlewares/approve_middleware");
const router = express.Router();

// PDF upload + update
router.post(
  "/transportadmin",
  checkRole(["super_admin"]),
  handleTempApproval,
  handleTempAction
);

module.exports = router;
