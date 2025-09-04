
const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../controllers/club_controllers/nss_controllers/nss_handle_controllers"); // your single controller

const {  handleTempApproval } = require("../../middlewares/approve_middleware"); 


router.post("/nssadmin",handleTempApproval,handleTempAction);

module.exports = router;
