
const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../controllers/club_controllers/ncc_army_controllers/army_handle_controllers"); // your single controller

const {  handleTempApproval } = require("../../middlewares/approve_middleware"); 


router.post("armyadmin",handleTempApproval,handleTempAction);

module.exports = router;
