const express = require("express");
const { handleTempAction } = require("../controllers/gallery_controllers/gallery_handle_controllers");
const {checkRole} = require("../middlewares/role_middleware")
const{handleTempApproval} = require("../middlewares/approve_middleware");
const router = express.Router();

router.post(
  "/galleryadmin",
  checkRole(["super_admin"]), 
  handleTempApproval,
  handleTempAction
);

module.exports = router;
