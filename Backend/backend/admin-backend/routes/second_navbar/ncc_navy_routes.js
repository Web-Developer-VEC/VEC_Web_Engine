
const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../middlewares/action_handle_middleware");  // your single controller

const {  handleTempApproval } = require("../../middlewares/approve_middleware"); 

const { insertData } = require("../../controllers/second_navbar/ncc_navy_controllers/navy_insert_controllers");
const { deleteData } = require("../../controllers/second_navbar/ncc_navy_controllers/navy_delete_controllers");
const { updateData } = require("../../controllers/second_navbar/ncc_navy_controllers/navy_update_controllers");


router.post("/navyadmin",handleTempApproval, handleTempAction( insertData, deleteData, updateData ));

module.exports = router;
