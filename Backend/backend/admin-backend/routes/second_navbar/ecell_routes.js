const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../middlewares/action_handle_middleware"); // your single controller
const { checkRole } = require("../../middlewares/role_middleware")
const {  handleTempApproval } = require("../../middlewares/approve_middleware"); 

const { insertData } = require("../../controllers/second_navbar/ecell_controller/ecell_insert_controller");
const { updateData } = require("../../controllers/second_navbar/ecell_controller/ecell_update_controller");
const { deleteData } = require("../../controllers/second_navbar/ecell_controller/ecell_delete_controller");



router.post(
  "/ecelladmin",
  checkRole(["super_admin"]), 
  handleTempApproval,
  handleTempAction( insertData , updateData , deleteData )
);

module.exports = router;

