const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../controllers/club_controllers"); // your single controller

const {  handleTempApproval } = require("../middlewares/approve_middleware"); 


router.post("/:collectionName/approve",handleTempApproval,handleTempAction);

module.exports = router;
