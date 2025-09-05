
const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../controllers/second_navbar/ncc_navy_controllers/navy_handle_controllers"); // your single controller

const {  handleTempApproval } = require("../../middlewares/approve_middleware"); 


router.post("/navyadmin",handleTempApproval,handleTempAction);

module.exports = router;
