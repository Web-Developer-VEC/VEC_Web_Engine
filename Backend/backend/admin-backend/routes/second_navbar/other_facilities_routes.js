const express = require("express");
const { handleTempAction } = require("../../middlewares/action_handle_middleware"); 
const {checkRole} = require("../../middlewares/role_middleware")
const{handleTempApproval} = require("../../middlewares/approve_middleware");
const router = express.Router();

const { insertData } = require("../../controllers/second_navbar/other_facilities_controllers/other_facilities_insert_controllers");
const { deleteData } = require("../../controllers/second_navbar/other_facilities_controllers/other_facilities_delete_controllers");
const { updateData } = require("../../controllers/second_navbar/other_facilities_controllers/other_facilities_update_controllers");

router.post(
  "/other_facilities_admin",
  checkRole(["super_admin"]), 
  handleTempApproval,
   handleTempAction( insertData, updateData ,deleteData )
);

module.exports = router;
