const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../../middlewares/action_handle_middleware");
const { checkRole } = require("../../../middlewares/role_middleware");
const { handleTempApproval } = require("../../../middlewares/approve_middleware");
const { insertData } = require("../../../controllers/top_navbar/academics_controllers/vision_mission_controllers/vision_mission_insert_controllers");
const { updateData } = require("../../../controllers/top_navbar/academics_controllers/vision_mission_controllers/vision_mission_update_controllers");
const { deleteData } = require("../../../controllers/top_navbar/academics_controllers/vision_mission_controllers/vision_mission_delete_controllers");

router.post(
  "/visionmissionadmin",
  checkRole(["super_admin"]),
  handleTempApproval,
  handleTempAction( insertData, updateData, deleteData)
);

module.exports = router; 
