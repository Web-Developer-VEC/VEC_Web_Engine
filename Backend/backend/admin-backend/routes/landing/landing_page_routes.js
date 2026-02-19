const express = require("express");
const router = express.Router();
const { handleTempAction } = require("../../middlewares/action_handle_middleware");
const { checkRole } = require("../../middlewares/role_middleware")
const {  handleTempApproval } = require("../../middlewares/approve_middleware");
const { insertData } = require("../../controllers/landing_page_controllers/landing_page_insert_controllers")
const{updateData}=require("../../controllers/landing_page_controllers/landing_page_update_controllers")
const {deleteData} = require('../../controllers/landing_page_controllers/landing_page_delete_controllers')

router.post(
  "/landingpageadmin",
  checkRole(["super_admin"]), 
  handleTempApproval,
  handleTempAction(  insertData , updateData , deleteData )
);

module.exports = router;

