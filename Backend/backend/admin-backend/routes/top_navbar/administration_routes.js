const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../middlewares/action_handle_middleware");
const { checkRole } = require("../../middlewares/role_middleware");
const { handleTempApproval } = require("../../middlewares/approve_middleware");

const { insertData } = require("../../controllers/top_navbar/administration_controllers/administration_insert_controller");
const { updateData } = require("../../controllers/top_navbar/administration_controllers/administration_update_controller");
const { deleteData } = require("../../controllers/top_navbar/administration_controllers/administration_delete_controller");

router.post(
  "/administrationadmin",
  checkRole(["super_admin"]),
  handleTempApproval,
  handleTempAction(insertData, updateData, deleteData)
);
module.exports = router;
