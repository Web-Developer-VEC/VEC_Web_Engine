
const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../middlewares/action_handle_middleware"); 
const {  handleTempApproval } = require("../../middlewares/approve_middleware"); 
const { checkRole } = require("../../middlewares/role_middleware");

const { insertData } = require("../../controllers/second_navbar/library_controllers/library_insert_controllers");
const { deleteData } = require("../../controllers/second_navbar/library_controllers/library_delete_controllers");
const { updateData } = require("../../controllers/second_navbar/library_controllers/library_update_controllers");

router.post("/libraryadmin",
    checkRole(["library_admin"]),
    handleTempApproval,
    handleTempAction( insertData, deleteData, updateData )
    ); 

module.exports = router;
