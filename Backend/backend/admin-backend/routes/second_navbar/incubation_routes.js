const express = require("express");
const { handleTempAction } = require("../../middlewares/action_handle_middleware")
const {checkRole} = require("../../middlewares/role_middleware")
const{handleTempApproval} = require("../../middlewares/approve_middleware");
const { insertData } = require("../../controllers/second_navbar/incubation_controllers/incubation_insert_controllers");
const { updateData } = require("../../controllers/second_navbar/incubation_controllers/incubation_update_controllers");
const { deleteData } = require("../../controllers/second_navbar/incubation_controllers/incubation_delete_controllers");
const router = express.Router();

router.post(
  "/incubationadmin",
  // checkRole(["superadmin"]), 
  handleTempApproval,
  handleTempAction(insertData, updateData, deleteData)
);

module.exports = router;
