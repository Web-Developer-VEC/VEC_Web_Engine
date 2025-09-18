const express = require("express");
const { handleTempAction } = require("../../middlewares/action_handle_middleware");
const {checkRole} = require("../../middlewares/role_middleware")
const{handleTempApproval} = require("../../middlewares/approve_middleware");
const router = express.Router();

const { insertData } = require("../../controllers/second_navbar/accreditations_and_ranking_controllers/accreditations_and_ranking_insert_controllers") 
const { updateData } = require("../../controllers/second_navbar/accreditations_and_ranking_controllers/accreditations_and_ranking_update_controllers")
const { deleteData } = require("../../controllers/second_navbar/accreditations_and_ranking_controllers/accreditations_and_ranking_delete_controllers")   
router.post(
  "/accreditations_and_ranking_admin",
  checkRole(["superadmin"]), 
  handleTempApproval,
  handleTempAction(insertData, updateData, deleteData)
);

module.exports = router;
