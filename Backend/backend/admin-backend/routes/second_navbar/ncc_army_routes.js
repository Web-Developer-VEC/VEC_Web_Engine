
const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../middlewares/action_handle_middleware"); // your single controller

const {  handleTempApproval } = require("../../middlewares/approve_middleware"); 

const { insertData } = require("../../controllers/second_navbar/ncc_army_controllers/army_insert_controllers");
const { deleteData } = require("../../controllers/second_navbar/ncc_army_controllers/army_delete_controllers");
const { updateData } = require("../../controllers/second_navbar/ncc_army_controllers/army_update_controllers");


router.post("/armyadmin",handleTempApproval, handleTempAction( insertData, deleteData, updateData ));

module.exports = router;
