
const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../controllers/club_controllers/yrc_controllers/yrc_handle_controllers"); // your single controller

const {  handleTempApproval } = require("../../middlewares/approve_middleware"); 


router.post("/yrcadmin",handleTempApproval,handleTempAction);

module.exports = router;
