const express = require("express");
const { handleTempAction } = require("../../controllers/second_navbar/other_facilities_controllers/other_facilities_handle_controllers");
const {checkRole} = require("../../middlewares/role_middleware")
const{handleTempApproval} = require("../../middlewares/approve_middleware");
const router = express.Router();

router.post(
  "/other_facilities_admin",
  checkRole(["super_admin"]), 
  handleTempApproval,
  handleTempAction
);

module.exports = router;
