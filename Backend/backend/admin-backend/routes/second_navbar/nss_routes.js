
const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../middlewares/action_handle_middleware"); // your single controller

const {  handleTempApproval } = require("../../middlewares/approve_middleware"); 

const { insertData } = require("../../controllers/second_navbar/nss_controllers/nss_insert_controllers");
const { deleteData } = require("../../controllers/second_navbar/nss_controllers/nss_delete_controllers");
const { updateData } = require("../../controllers/second_navbar/nss_controllers/nss_update_controllers");


router.post("/nssadmin",handleTempApproval, handleTempAction( insertData, deleteData, updateData ));

module.exports = router;
