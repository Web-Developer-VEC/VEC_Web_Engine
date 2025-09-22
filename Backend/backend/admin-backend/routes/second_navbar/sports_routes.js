
const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../middlewares/action_handle_middleware");
const { checkRole } = require("../../middlewares/role_middleware")
const {  handleTempApproval } = require("../../middlewares/approve_middleware"); 

const {insertData} = require("../../controllers/second_navbar/sports_controllers/sports_insert_controllers");
const { updateData } = require("../../controllers/second_navbar/sports_controllers/sports_update_controllers");
const { deleteData } = require("../../controllers/second_navbar/sports_controllers/sports_delete_controllers");


router.post("/sportsadmin",
    checkRole(["super_admin"]),
    handleTempApproval,
    handleTempAction(insertData, updateData, deleteData)
); 

module.exports = router;
