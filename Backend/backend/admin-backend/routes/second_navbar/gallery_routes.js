const express = require("express");
const { handleTempAction } = require("../../middlewares/action_handle_middleware"); 
const {checkRole} = require("../../middlewares/role_middleware")
const{handleTempApproval} = require("../../middlewares/approve_middleware");

const { insertData } = require("../../controllers/second_navbar/gallery_controllers/gallery_insert_controllers");
const { deleteData } = require("../../controllers/second_navbar/gallery_controllers/gallery_delete_controllers");

const router = express.Router();

router.post(
  "/galleryadmin",
  checkRole(["super_admin"]), 
  handleTempApproval,
  handleTempAction( insertData, deleteData )
);

module.exports = router;
